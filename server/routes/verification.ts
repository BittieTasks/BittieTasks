import { Router } from "express";
import { db } from "../db";
import { users, userActivity, verificationDocuments, safetyReports } from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { 
  phoneVerificationLimiter, 
  emailVerificationLimiter,
  generateVerificationCode,
  generateSecureToken,
  validatePhoneNumber,
  validateDocumentUpload,
  analyzeDocumentFraud,
  calculateTrustScore,
  requireVerification
} from "../middleware/verification";

const router = Router();

// Configure multer for document uploads
const documentUpload = multer({
  dest: "uploads/documents",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPG, PNG) and PDF files are allowed"));
    }
  },
});

// Send phone verification code
router.post("/phone/send-code", phoneVerificationLimiter, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { phoneNumber } = req.body;
    
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Valid phone number required" });
    }

    // Check if phone number is already verified by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(and(
        eq(users.phoneNumber, phoneNumber),
        eq(users.isPhoneVerified, true)
      ))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      return res.status(400).json({ message: "Phone number already verified by another account" });
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification code
    await db
      .update(users)
      .set({
        phoneNumber: phoneNumber,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: expiresAt,
      })
      .where(eq(users.id, userId));

    // In production, send SMS via Twilio or similar service
    console.log(`SMS verification code for ${phoneNumber}: ${verificationCode}`);
    
    // Log activity
    await db.insert(userActivity).values({
      userId: userId,
      activityType: "phone_verification_requested",
      metadata: { phoneNumber, ip: req.ip }
    });

    res.json({ 
      message: "Verification code sent successfully",
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// Verify phone number
router.post("/phone/verify", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { verificationCode } = req.body;
    
    if (!verificationCode || verificationCode.length !== 6) {
      return res.status(400).json({ message: "Valid 6-digit verification code required" });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user[0];

    // Check if code matches and hasn't expired
    if (userData.phoneVerificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!userData.phoneVerificationExpires || userData.phoneVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    // Update user as phone verified
    const newTrustScore = calculateTrustScore({
      ...userData,
      isPhoneVerified: true
    });

    await db
      .update(users)
      .set({
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
        trustScore: newTrustScore
      })
      .where(eq(users.id, userId));

    // Log successful verification
    await db.insert(userActivity).values({
      userId: userId,
      activityType: "phone_verified",
      metadata: { trustScore: newTrustScore, ip: req.ip }
    });

    res.json({ 
      message: "Phone number verified successfully",
      trustScore: newTrustScore
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ message: "Failed to verify phone number" });
  }
});

// Upload identity documents
router.post("/identity/upload", 
  requireVerification('phone'), 
  documentUpload.array('documents', 5), 
  async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const files = req.files as Express.Multer.File[];
      const { documentType } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one document is required" });
      }

      if (!documentType || !['drivers_license', 'passport', 'state_id', 'utility_bill'].includes(documentType)) {
        return res.status(400).json({ message: "Valid document type required" });
      }

      // Validate and analyze each uploaded file
      let totalRiskScore = 0;
      const analysisResults = [];
      
      for (const file of files) {
        const validation = validateDocumentUpload(file);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }

        // Advanced fraud analysis
        const fraudAnalysis = await analyzeDocumentFraud(file);
        analysisResults.push(fraudAnalysis);
        totalRiskScore += fraudAnalysis.riskScore;

        // Block obviously fraudulent documents
        if (fraudAnalysis.riskScore > 50) {
          return res.status(400).json({ 
            message: "Document appears to be digitally manipulated or suspicious",
            reasons: fraudAnalysis.reasons,
            riskScore: fraudAnalysis.riskScore
          });
        }
      }

      // Save document records
      const documentRecords = await Promise.all(
        files.map(async (file) => {
          const secureFilename = `${userId}_${documentType}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
          const finalPath = path.join('uploads/documents', secureFilename);
          
          // Move file to secure location
          fs.renameSync(file.path, finalPath);

          return db.insert(verificationDocuments).values({
            userId: userId,
            documentType: documentType,
            documentUrl: finalPath,
            verificationStatus: "pending"
          }).returning();
        })
      );

      // Log activity with fraud analysis results
      await db.insert(userActivity).values({
        userId: userId,
        activityType: "identity_documents_uploaded",
        metadata: { 
          documentType, 
          fileCount: files.length,
          ip: req.ip,
          riskScore: totalRiskScore,
          fraudAnalysis: analysisResults.map(r => ({
            suspicious: r.suspicious,
            riskScore: r.riskScore,
            reasonCount: r.reasons.length
          }))
        },
        riskScore: Math.min(totalRiskScore, 100),
        flagged: totalRiskScore > 30
      });

      res.json({ 
        message: "Documents uploaded successfully",
        documents: documentRecords.flat(),
        status: "pending_review"
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  }
);

// Get verification status
router.get("/status", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user[0];

    // Get pending documents
    const pendingDocs = await db
      .select()
      .from(verificationDocuments)
      .where(and(
        eq(verificationDocuments.userId, userId),
        eq(verificationDocuments.verificationStatus, "pending")
      ));

    const trustScore = calculateTrustScore(userData);

    res.json({
      emailVerified: userData.isEmailVerified,
      phoneVerified: userData.isPhoneVerified,
      identityVerified: userData.isIdentityVerified,
      backgroundChecked: userData.isBackgroundChecked,
      trustScore: trustScore,
      riskScore: userData.riskScore || 0,
      pendingDocuments: pendingDocs.length,
      verificationLevel: getVerificationLevel(userData),
      nextSteps: getNextVerificationSteps(userData)
    });
  } catch (error) {
    console.error("Verification status error:", error);
    res.status(500).json({ message: "Failed to get verification status" });
  }
});

// Report user for suspicious activity
router.post("/report", requireVerification('email'), async (req, res) => {
  try {
    const reporterUserId = (req.session as any)?.userId;
    const { reportedUserId, reportType, description, evidence } = req.body;

    if (!reportedUserId || !reportType || !description) {
      return res.status(400).json({ message: "Reported user, report type, and description are required" });
    }

    // Validate report type
    const validReportTypes = ['fraud', 'harassment', 'inappropriate_behavior', 'spam', 'fake_profile', 'other'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ message: "Invalid report type" });
    }

    // Check if reported user exists
    const reportedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, reportedUserId))
      .limit(1);

    if (reportedUser.length === 0) {
      return res.status(404).json({ message: "Reported user not found" });
    }

    // Create safety report
    const report = await db.insert(safetyReports).values({
      reporterUserId: reporterUserId,
      reportedUserId: reportedUserId,
      reportType: reportType,
      description: description,
      evidence: evidence || [],
      priority: reportType === 'fraud' ? 'high' : 'medium'
    }).returning();

    // Log activity for both users
    await Promise.all([
      db.insert(userActivity).values({
        userId: reporterUserId,
        activityType: "safety_report_filed",
        metadata: { reportedUserId, reportType, ip: req.ip }
      }),
      db.insert(userActivity).values({
        userId: reportedUserId,
        activityType: "safety_report_received",
        metadata: { reporterUserId, reportType, reportId: report[0].id },
        riskScore: 10 // Increase risk score for reported user
      })
    ]);

    // Increase reported user's risk score
    await db
      .update(users)
      .set({
        riskScore: (reportedUser[0].riskScore || 0) + 10
      })
      .where(eq(users.id, reportedUserId));

    res.json({ 
      message: "Report submitted successfully",
      reportId: report[0].id,
      status: "pending_review"
    });
  } catch (error) {
    console.error("Safety report error:", error);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

// Helper functions
function getVerificationLevel(user: any): string {
  if (user.isBackgroundChecked) return "full";
  if (user.isIdentityVerified) return "identity";
  if (user.isPhoneVerified) return "phone";
  if (user.isEmailVerified) return "email";
  return "none";
}

function getNextVerificationSteps(user: any): string[] {
  const steps = [];
  
  if (!user.isEmailVerified) {
    steps.push("Verify your email address");
  }
  if (!user.isPhoneVerified) {
    steps.push("Verify your phone number");
  }
  if (!user.isIdentityVerified) {
    steps.push("Upload identity documents");
  }
  if (!user.isBackgroundChecked) {
    steps.push("Complete background check (for task creators)");
  }

  return steps;
}

export default router;
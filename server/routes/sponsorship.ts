import { Router } from "express";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { sponsoredTasks, corporatePartners, ethicalEvaluations, sponsorshipApplications } from "../../shared/schema";
// Note: Using Supabase authentication - storage removed
import { requireAuth } from "../auth/supabase-auth";

const router = Router();

// Schema for corporate partnership application
const partnerApplicationSchema = z.object({
  companyName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactName: z.string().min(2).max(100),
  website: z.string().url(),
  industry: z.string(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  monthlyBudget: z.number().min(1000).max(100000),
  taskTypes: z.array(z.string()).min(1),
  targetAudience: z.string(),
  hrcScore: z.number().min(0).max(100).optional(),
  deiInitiatives: z.string(),
  lgbtqSupport: z.boolean(),
  environmentalPractices: z.string(),
  laborStandards: z.string(),
  familySafetyCompliance: z.boolean(),
  dataPrivacyCompliance: z.boolean(),
  proposedTasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    payment: z.number().min(22).max(60),
    duration: z.number().min(15).max(180),
    participantCount: z.number().min(5).max(50)
  })).optional()
});

// Schema for sponsored task creation
const sponsoredTaskSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  payment: z.number().min(22).max(60), // Participant earnings
  platformFee: z.number().min(15).max(25), // Our fee
  duration: z.number().min(15).max(180),
  categoryId: z.string(),
  maxParticipants: z.number().min(5).max(50),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  requirements: z.array(z.string()).default([]),
  brandName: z.string(),
  brandLogo: z.string().optional(),
  brandColor: z.string().optional(),
  targetAudience: z.string(),
  specialReward: z.string().optional()
});

// Apply for corporate partnership
router.post("/apply", async (req, res) => {
  try {
    const applicationData = partnerApplicationSchema.parse(req.body);
    
    // Calculate ethical score automatically
    let ethicalScore = 50; // Base score
    
    // HRC Corporate Equality Index scoring
    if (applicationData.hrcScore) {
      ethicalScore += Math.min(30, applicationData.hrcScore * 0.3);
    }
    
    // LGBTQ+ support bonus
    if (applicationData.lgbtqSupport) {
      ethicalScore += 10;
    }
    
    // Family safety compliance
    if (applicationData.familySafetyCompliance) {
      ethicalScore += 10;
    }
    
    // Data privacy compliance
    if (applicationData.dataPrivacyCompliance) {
      ethicalScore += 10;
    }
    
    // DEI initiatives scoring (basic text analysis)
    if (applicationData.deiInitiatives.length > 100) {
      ethicalScore += 5;
    }
    
    // Determine approval tier based on score
    let approvalTier: 'premium' | 'standard' | 'basic' | 'rejected' = 'rejected';
    if (ethicalScore >= 80) {
      approvalTier = 'premium';
    } else if (ethicalScore >= 65) {
      approvalTier = 'standard';
    } else if (ethicalScore >= 50) {
      approvalTier = 'basic';
    }
    
    // Create the application
    const application = await storage.createSponsorshipApplication({
      companyName: applicationData.companyName,
      contactEmail: applicationData.contactEmail,
      contactName: applicationData.contactName,
      website: applicationData.website,
      industry: applicationData.industry,
      companySize: applicationData.companySize,
      monthlyBudget: applicationData.monthlyBudget,
      taskTypes: applicationData.taskTypes,
      targetAudience: applicationData.targetAudience,
      ethicalScore,
      approvalTier,
      status: approvalTier === 'rejected' ? 'rejected' : 'pending',
      applicationData: applicationData,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null
    });
    
    // If automatically approved (premium tier), create partner record
    if (approvalTier === 'premium') {
      await storage.createCorporatePartner({
        companyName: applicationData.companyName,
        contactEmail: applicationData.contactEmail,
        contactName: applicationData.contactName,
        website: applicationData.website,
        industry: applicationData.industry,
        approvalTier: 'premium',
        ethicalScore,
        monthlyBudget: applicationData.monthlyBudget,
        taskTypes: applicationData.taskTypes,
        isActive: true,
        partnerSince: new Date(),
        totalSpent: 0,
        tasksCreated: 0,
        averageRating: 0
      });
      
      // Update application status
      await storage.updateSponsorshipApplication(application.id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: 'auto-approval-system',
        reviewNotes: 'Automatically approved based on excellent ethical score'
      });
    }
    
    res.json({
      success: true,
      applicationId: application.id,
      ethicalScore,
      approvalTier,
      status: approvalTier === 'premium' ? 'approved' : 
              approvalTier === 'rejected' ? 'rejected' : 'pending',
      message: approvalTier === 'premium' 
        ? 'Congratulations! Your application has been automatically approved for Premium tier partnership.'
        : approvalTier === 'rejected'
        ? 'Your application does not meet our ethical standards. Please review our partnership criteria and reapply.'
        : 'Your application is under review. We will contact you within 24-48 hours.',
      nextSteps: approvalTier === 'premium' 
        ? 'You can now create sponsored tasks through our partner portal.'
        : approvalTier === 'rejected'
        ? 'Focus on improving HRC Corporate Equality Index score, DEI initiatives, and family safety compliance.'
        : 'Our ethical review team will evaluate your application and contact you soon.'
    });
  } catch (error) {
    console.error("Partnership application error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process partnership application" 
    });
  }
});

// Get partnership application status
router.get("/application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const application = await storage.getSponsorshipApplication(id);
    
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json({
      id: application.id,
      companyName: application.companyName,
      status: application.status,
      ethicalScore: application.ethicalScore,
      approvalTier: application.approvalTier,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewNotes: application.reviewNotes
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ error: "Failed to get application status" });
  }
});

// Create sponsored task (for approved partners)
router.post("/create-task", async (req, res) => {
  try {
    const taskData = sponsoredTaskSchema.parse(req.body);
    
    // Verify partner exists and is approved
    const partner = await storage.getCorporatePartnerByName(taskData.brandName);
    if (!partner || !partner.isActive) {
      return res.status(403).json({ 
        error: "Only approved corporate partners can create sponsored tasks" 
      });
    }
    
    // Calculate total cost for the company
    const participantCost = taskData.payment * taskData.maxParticipants;
    const platformRevenue = taskData.platformFee * taskData.maxParticipants;
    const totalCost = participantCost + platformRevenue;
    
    // Check if within budget
    if (totalCost > partner.monthlyBudget) {
      return res.status(400).json({
        error: `Task cost ($${totalCost}) exceeds monthly budget ($${partner.monthlyBudget})`
      });
    }
    
    // Create the sponsored task
    const sponsoredTask = await storage.createSponsoredTask({
      partnerId: partner.id,
      title: taskData.title,
      description: taskData.description,
      payment: taskData.payment,
      platformFee: taskData.platformFee,
      totalBudget: totalCost,
      duration: taskData.duration,
      categoryId: taskData.categoryId,
      maxParticipants: taskData.maxParticipants,
      currentParticipants: 0,
      startDate: new Date(taskData.startDate),
      endDate: new Date(taskData.endDate),
      requirements: taskData.requirements,
      status: 'active',
      brandName: taskData.brandName,
      brandLogo: taskData.brandLogo,
      brandColor: taskData.brandColor,
      targetAudience: taskData.targetAudience,
      specialReward: taskData.specialReward,
      createdAt: new Date()
    });
    
    // Update partner stats
    await storage.updateCorporatePartner(partner.id, {
      tasksCreated: partner.tasksCreated + 1,
      totalSpent: partner.totalSpent + totalCost
    });
    
    res.json({
      success: true,
      taskId: sponsoredTask.id,
      totalCost,
      participantEarnings: taskData.payment,
      platformRevenue: taskData.platformFee,
      maxParticipants: taskData.maxParticipants,
      message: `Sponsored task created successfully. Total investment: $${totalCost}`
    });
  } catch (error) {
    console.error("Create sponsored task error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create sponsored task" 
    });
  }
});

// Get sponsored tasks for a partner
router.get("/partner/:partnerName/tasks", async (req, res) => {
  try {
    const { partnerName } = req.params;
    const partner = await storage.getCorporatePartnerByName(partnerName);
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    const tasks = await storage.getSponsoredTasksByPartner(partner.id);
    
    res.json({
      partner: {
        name: partner.companyName,
        tier: partner.approvalTier,
        totalSpent: partner.totalSpent,
        tasksCreated: partner.tasksCreated
      },
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        payment: task.payment,
        platformFee: task.platformFee,
        totalBudget: task.totalBudget,
        participants: task.currentParticipants,
        maxParticipants: task.maxParticipants,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate
      }))
    });
  } catch (error) {
    console.error("Get partner tasks error:", error);
    res.status(500).json({ error: "Failed to get partner tasks" });
  }
});

// Get revenue analytics
router.get("/analytics/revenue", requireAuth, async (req, res) => {
  try {
    const sponsoredTasks = await storage.getAllSponsoredTasks();
    
    const analytics = {
      totalRevenue: sponsoredTasks.reduce((sum, task) => 
        sum + (task.platformFee * task.currentParticipants), 0),
      totalParticipantEarnings: sponsoredTasks.reduce((sum, task) => 
        sum + (task.payment * task.currentParticipants), 0),
      activeTasks: sponsoredTasks.filter(task => task.status === 'active').length,
      completedTasks: sponsoredTasks.filter(task => task.status === 'completed').length,
      totalParticipants: sponsoredTasks.reduce((sum, task) => 
        sum + task.currentParticipants, 0),
      averageTaskValue: sponsoredTasks.length > 0 
        ? sponsoredTasks.reduce((sum, task) => sum + task.totalBudget, 0) / sponsoredTasks.length 
        : 0,
      revenueByMonth: {}, // Would implement time-based grouping
      topPartners: [] // Would implement partner ranking
    };
    
    res.json(analytics);
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({ error: "Failed to get revenue analytics" });
  }
});

// Join sponsored task (for users)
router.post("/join/:taskId", requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const task = await storage.getSponsoredTask(taskId);
    if (!task) {
      return res.status(404).json({ error: "Sponsored task not found" });
    }
    
    if (task.currentParticipants >= task.maxParticipants) {
      return res.status(400).json({ error: "Task is at maximum capacity" });
    }
    
    if (task.status !== 'active') {
      return res.status(400).json({ error: "Task is not currently active" });
    }
    
    // Check if user already joined
    const existingParticipation = await storage.getSponsoredTaskParticipation(taskId, userId);
    if (existingParticipation) {
      return res.status(400).json({ error: "You have already joined this task" });
    }
    
    // Add user to task
    await storage.createSponsoredTaskParticipation({
      taskId,
      userId,
      joinedAt: new Date(),
      status: 'active',
      paymentStatus: 'pending',
      completedAt: null,
      earnings: task.payment
    });
    
    // Update task participant count
    await storage.updateSponsoredTask(taskId, {
      currentParticipants: task.currentParticipants + 1
    });
    
    res.json({
      success: true,
      taskTitle: task.title,
      earnings: task.payment,
      message: `Successfully joined ${task.brandName} sponsored task. You'll earn $${task.payment} upon completion.`
    });
  } catch (error) {
    console.error("Join sponsored task error:", error);
    res.status(500).json({ error: "Failed to join sponsored task" });
  }
});

export default router;
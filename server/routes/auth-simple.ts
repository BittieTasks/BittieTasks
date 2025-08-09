import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { storage } from '../storage';
import rateLimit from 'express-rate-limit';
import { sendVerificationEmail } from '../services/emailService';

const router = Router();

// Simple rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many attempts, please try again later' }
});

// Simple signup - no email verification required
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = randomUUID();
    
    // Create user - needs verification
    const user = await storage.createUser({
      username: email.split('@')[0],
      email,
      passwordHash,
      firstName,
      lastName,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      totalEarnings: "0.00",
      rating: "0.00",
      completedTasks: 0,
      currentStreak: 0,
      skills: [],
      trustScore: 0,
      riskScore: 0,
      identityScore: 0,
      isCaptchaVerified: false,
      captchaScore: "0.0",
      behaviorScore: 0,
      governmentIdUploaded: false,
      governmentIdVerified: false,
      faceVerificationCompleted: false,
      livelinessCheckPassed: false,
      mouseMovementAnalyzed: false,
      keystrokePatternAnalyzed: false,
      sessionBehaviorScore: 0,
      humanVerificationLevel: "basic",
      twoFactorEnabled: false,
      backupCodes: [],
      failedLoginAttempts: 0,
      accountLocked: false,
      subscriptionTier: "free",
      subscriptionStatus: "active",
      monthlyTaskLimit: 5,
      monthlyTasksCompleted: 0,
      prioritySupport: false,
      adFree: false,
      premiumBadge: false,
      referralCode: randomUUID().substring(0, 8),
      referredBy: null,
      referralEarnings: "0.00",
      totalReferrals: 0,
      bonusEarnings: "0.00",
      locationLat: null,
      locationLng: null,
      locationCity: null,
      locationState: null,
      maxTravelDistance: 10,
      preferredTaskCategories: [],
      notificationEmail: true,
      notificationSms: false,
      notificationPush: true,
      privacyLevel: "standard",
      dataRetentionDays: 365,
      analyticsOptOut: false,
      marketingOptOut: false,
      thirdPartySharing: false
    });

    // Send verification email
    try {
      const verificationUrl = `https://${req.get('host')}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(email, firstName, verificationToken);
      console.log(`✅ User created and verification email sent: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user can resend verification email later
    }

    res.status(201).json({ 
      message: 'Account created successfully! Please check your email to verify your account.',
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      needsVerification: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

// Simple login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in. Check your inbox for the verification email.',
        needsVerification: true 
      });
    }

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).user = user;

    console.log(`✅ User logged in: ${user.email}`);
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/user', (req, res) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user by verification token
    const users = await storage.getUsers();
    const user = users.find(u => u.emailVerificationToken === token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Update user as verified
    await storage.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null
    });

    console.log(`✅ Email verified for user: ${user.email}`);
    res.json({ message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
});

// Resend verification email
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    await storage.updateUser(user.id, {
      emailVerificationToken: verificationToken
    });

    // Send verification email
    const verificationUrl = `https://${req.get('host')}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, user.firstName, verificationToken);

    res.json({ message: 'Verification email sent! Please check your inbox.' });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

export default router;
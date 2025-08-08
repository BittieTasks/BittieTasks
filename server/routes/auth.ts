import type { Express } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { supabase } from '../supabase';
import { requireAuth, optionalAuth } from '../auth/supabase-auth';
import type { InsertUser } from '@shared/schema';
import { sendVerificationEmail } from '../services/emailService';

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerAuthRoutes(app: Express) {
  // Sign up with Supabase
  app.post('/api/auth/signup', authLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      // Password validation
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create user record in our database
      const hashedPassword = await bcrypt.hash(password, 12);
      const emailVerificationToken = randomUUID();

      const userData: InsertUser = {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        isEmailVerified: false,
        emailVerificationToken,
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`
      };

      const user = await storage.createUser(userData);

      // Send verification email with full name
      const displayName = `${firstName} ${lastName}`;
      await sendVerificationEmail(email, displayName, emailVerificationToken);

      res.status(201).json({
        message: 'Account created successfully! Please check your email to verify your account.',
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  // Sign in (using our own storage for development)
  app.post('/api/auth/signin', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Get user from our database/storage
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
      };

      // Explicitly save the session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }

        console.log(`✅ User logged in successfully: ${user.email}`);

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified
          }
        });
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Sign out
  app.post('/api/auth/signout', async (req, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Get current user (using session)
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        totalEarnings: user.totalEarnings,
        rating: user.rating,
        completedTasks: user.completedTasks
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Legacy endpoint for compatibility
  app.get('/api/user/current', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        rating: user.rating,
        firstName: user.firstName,
        lastName: user.lastName,
        totalEarnings: user.totalEarnings,
        completedTasks: user.completedTasks,
        currentStreak: user.currentStreak,
        isEmailVerified: user.isEmailVerified,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        monthlyTaskLimit: user.monthlyTaskLimit,
        monthlyTasksCompleted: user.monthlyTasksCompleted
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Verify email (GET endpoint for URL links)
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;

      console.log(`🔍 Email verification request with token: ${token}`);

      if (!token) {
        return res.status(400).json({ message: 'Verification token required' });
      }

      // Find user by verification token
      const users = await storage.getUsers();
      console.log(`📊 Total users in database: ${users.length}`);
      
      const usersWithTokens = users.filter(u => u.emailVerificationToken);
      console.log(`🔑 Users with verification tokens: ${usersWithTokens.length}`);
      console.log('Token details:', usersWithTokens.map(u => ({ 
        email: u.email, 
        token: u.emailVerificationToken?.substring(0, 8) + '...',
        verified: u.isEmailVerified 
      })));
      
      const user = users.find(u => u.emailVerificationToken === token);
      console.log(`👤 User found for token: ${user ? `YES - ${user.email}` : 'NO'}`);

      if (!user) {
        console.log(`❌ Token not found: ${token}`);
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Check if already verified
      if (user.isEmailVerified) {
        console.log(`✅ User ${user.email} already verified`);
        return res.json({ verified: true, message: 'Email already verified! You can log in.' });
      }

      // Update user as verified
      const updatedUser = await storage.updateUser(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null
      });

      console.log(`✅ Email verification successful for: ${user.email}`);
      res.json({ verified: true, message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
      console.error('❌ Email verification error:', error);
      res.status(500).json({ verified: false, message: 'Failed to verify email' });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      console.log(`🔄 Resend verification request for: ${email}`);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'If an account exists with that email, a verification link will be sent.' });
      }

      if (user.isEmailVerified) {
        return res.json({ message: 'This email is already verified. You can log in.' });
      }

      // Generate new verification token
      const emailVerificationToken = randomUUID();
      await storage.updateUser(user.id, {
        emailVerificationToken
      });

      // Send new verification email
      const displayName = `${user.firstName} ${user.lastName}`;
      await sendVerificationEmail(email, displayName, emailVerificationToken);

      console.log(`✅ New verification email sent to: ${email}`);
      res.json({ message: 'Verification email sent! Please check your inbox.' });

    } catch (error) {
      console.error('❌ Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification email' });
    }
  });
}
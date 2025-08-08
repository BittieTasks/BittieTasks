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

      // Send verification email
      await sendVerificationEmail(email, firstName, emailVerificationToken);

      res.status(201).json({
        message: 'Account created successfully! Please check your email to verify your account.',
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  // Sign in with Supabase
  app.post('/api/auth/signin', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!authData.session) {
        return res.status(401).json({ message: 'Failed to create session' });
      }

      // Get user from our database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found in database' });
      }

      res.json({
        message: 'Login successful',
        accessToken: authData.session.access_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified
        }
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Sign out
  app.post('/api/auth/signout', requireAuth, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await supabase.auth.signOut();
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Get current user
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const user = req.user;
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
  app.get('/api/user/current', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Verify email (GET endpoint for URL links)
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;

      console.log(`Verification request with token: ${token}`);

      if (!token) {
        return res.status(400).json({ message: 'Verification token required' });
      }

      // Find user by verification token
      const users = await storage.getUsers();
      console.log(`Total users in database: ${users.length}`);
      console.log('Users with verification tokens:', users.filter(u => u.emailVerificationToken).map(u => ({ email: u.email, token: u.emailVerificationToken })));
      
      const user = users.find(u => u.emailVerificationToken === token);
      console.log(`User found for token: ${user ? 'YES' : 'NO'}`);

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Update user as verified
      await storage.updateUser(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null
      });

      res.json({ verified: true, message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ verified: false, message: 'Failed to verify email' });
    }
  });
}
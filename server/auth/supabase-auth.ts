import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import { storage } from '../storage';

// Middleware to check authentication via Supabase session
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get the user record from our database
    const appUser = await storage.getUserByEmail(user.email!);
    
    if (!appUser) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    // Add user to request object
    req.user = appUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Optional authentication middleware (doesn't fail if not authenticated)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const appUser = await storage.getUserByEmail(user.email!);
        if (appUser) {
          req.user = appUser;
        }
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Declare user property on Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
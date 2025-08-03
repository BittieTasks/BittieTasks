import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskCompletionSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import legalRoutes from './routes/legal';

// Configure multer for file uploads
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Security middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
      },
    },
  }));
  
  // Apply rate limiting only to login endpoints
  app.use("/api/auth/login", loginLimiter);
  app.use("/api/auth/signup", loginLimiter);

  // Initialize daily challenges on startup
  try {
    if (typeof storage.initializeDailyChallenges === 'function') {
      await storage.initializeDailyChallenges();
      console.log("Daily challenges initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing daily challenges:", error);
  }

  // Legal compliance routes
  app.use('/api/legal', legalRoutes);

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one number" });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one special character" });
      }

      // Check if user already exists
      const existingUsers = await storage.getUsers();
      const userExists = existingUsers.some(user => user.email === email);
      
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = await storage.createUser({
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        profilePicture: null,
        totalEarnings: "0.00",
        rating: "5.0",
        completedTasks: 0,
        currentStreak: 0,
        skills: [],
        availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      });

      // Store user ID in session
      (req.session as any).userId = newUser.id;

      res.json({ message: "Account created successfully", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const users = await storage.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password hash
      if (!user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Store user ID in session
      (req.session as any).userId = user.id;
      
      res.json({ message: "Login successful", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Demo login endpoint
  app.post("/api/auth/demo", async (req, res) => {
    try {
      // Create or get demo user
      const demoUser = {
        id: "demo-user-id",
        firstName: "Demo",
        lastName: "User",
        email: "demo@taskparent.com",
        phone: "(555) 123-4567",
        bio: "Demo account for exploring TaskParent features",
        skills: ["Cooking", "Cleaning", "Organizing"],
        rating: 4.8,
        completedTasks: 45,
        earnings: 1250.75,
        joinedAt: "2024-01-15",
        verified: true,
        profileImage: null,
        location: "Demo City, ST",
        availability: "Weekdays 9am-5pm",
      };

      // Store demo user in session
      (req.session as any).userId = demoUser.id;
      (req.session as any).isDemo = true;

      res.json({ message: "Demo login successful", user: demoUser });
    } catch (error) {
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Get current user
  app.get("/api/user/current", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const isDemo = (req.session as any)?.isDemo;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Handle demo user
      if (isDemo && userId === "demo-user-id") {
        const demoUser = {
          id: "demo-user-id",
          firstName: "Demo",
          lastName: "User",
          email: "demo@taskparent.com",
          phone: "(555) 123-4567",
          bio: "Demo account for exploring TaskParent features",
          skills: ["Cooking", "Cleaning", "Organizing"],
          rating: 4.8,
          completedTasks: 45,
          earnings: 1250.75,
          joinedAt: "2024-01-15",
          verified: true,
          profileImage: null,
          location: "Demo City, ST",
          availability: "Weekdays 9am-5pm",
        };
        return res.json(demoUser);
      }

      // Get regular user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Get all task categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getTaskCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const { category } = req.query;
      let tasks;
      
      if (category && typeof category === "string") {
        tasks = await storage.getTasksByCategory(category);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { title, description, categoryId, payment, duration, difficulty, requirements, taskType, sponsorInfo } = req.body;
      
      if (!title || !description || !categoryId || !payment) {
        return res.status(400).json({ message: "Title, description, category, and payment are required" });
      }

      const taskData = {
        title,
        description,
        categoryId,
        payment,
        duration,
        difficulty: difficulty || "easy",
        requirements,
        taskType: taskType || "shared",
        imageUrl: null,
        sponsorInfo: sponsorInfo || null
      };

      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Get specific task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Submit task completion
  app.post("/api/tasks/:id/complete", upload.array("proofFiles", 5), async (req, res) => {
    try {
      const taskId = req.params.id;
      const { submissionNotes } = req.body;
      
      // Get user from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Handle uploaded files
      const proofFiles = req.files ? 
        (req.files as Express.Multer.File[]).map(file => file.filename) : [];

      const completionData = {
        taskId,
        userId,
        status: "pending" as const,
        submissionNotes,
        proofFiles,
        earnings: task.payment
      };

      const completion = await storage.createTaskCompletion(completionData);
      res.json(completion);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit task completion" });
    }
  });

  // Get user's task completions
  app.get("/api/user/:userId/completions", async (req, res) => {
    try {
      const completions = await storage.getTaskCompletions(req.params.userId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task completions" });
    }
  });

  // Get user's messages
  app.get("/api/user/:userId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Achievement routes
  app.get('/api/achievements/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Error fetching achievements' });
    }
  });

  app.get('/api/achievements/definitions', async (req, res) => {
    try {
      const definitions = await storage.getAchievementDefinitions();
      res.json(definitions);
    } catch (error) {
      console.error('Error fetching achievement definitions:', error);
      res.status(500).json({ message: 'Error fetching achievement definitions' });
    }
  });

  app.post('/api/achievements/check', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check and award achievements based on user activity
      const userTasks = await storage.getTaskCompletions(userId);
      const newAchievements = [];

      // Check for first dollar achievement
      if (userTasks.length === 1 && !await hasAchievement(userId, 'first_dollar')) {
        const achievement = await storage.createUserAchievement({
          userId,
          achievementType: 'first_dollar',
          achievementData: { earnedAmount: userTasks[0].earnings },
          isVisible: true,
          progress: 1,
          maxProgress: 1
        });
        newAchievements.push(achievement);
      }

      res.json({ newAchievements });
    } catch (error) {
      console.error('Error checking achievements:', error);
      res.status(500).json({ message: 'Error checking achievements' });
    }
  });

  async function hasAchievement(userId: string, achievementType: string): Promise<boolean> {
    const achievements = await storage.getUserAchievements(userId);
    return achievements.some(a => a.achievementType === achievementType);
  }

  // Daily Challenges API Routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getDailyChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/today/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const todaysChallenges = await storage.getTodaysChallenges(userId);
      
      // Enrich with challenge details
      const enrichedChallenges = await Promise.all(
        todaysChallenges.map(async (userChallenge) => {
          const challenges = await storage.getDailyChallenges();
          const challenge = challenges.find(c => c.id === userChallenge.challengeId);
          return {
            ...userChallenge,
            challenge
          };
        })
      );
      
      res.json(enrichedChallenges);
    } catch (error) {
      console.error("Error fetching today's challenges:", error);
      res.status(500).json({ message: "Failed to fetch today's challenges" });
    }
  });

  app.post("/api/challenges/:userChallengeId/complete", async (req, res) => {
    try {
      const { userChallengeId } = req.params;
      const { reflection } = req.body;
      
      const completedChallenge = await storage.completeChallenge(userChallengeId, reflection);
      
      if (!completedChallenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(completedChallenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  app.get("/api/user/:userId/challenges", async (req, res) => {
    try {
      const { userId } = req.params;
      const { date } = req.query;
      
      const targetDate = date ? new Date(date as string) : undefined;
      const userChallenges = await storage.getUserChallenges(userId, targetDate);
      
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // ADMIN ROUTES - Platform Owner Management
  const isAdmin = (req: any, res: any, next: any) => {
    const session = req.session as any;
    // In demo mode, allow admin access. In production, check admin status
    if (session?.userId === 'demo-user-id' || session?.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  };

  // Admin Dashboard - Platform Statistics
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const tasks = await storage.getAllTasks();
      const completions = await storage.getAllTaskCompletions();

      // Calculate platform metrics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => {
        const lastActive = new Date(u.lastLogin || u.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      }).length;

      const pendingApprovals = completions.filter(c => c.status === 'pending').length;
      const approvedCompletions = completions.filter(c => c.status === 'approved');
      
      // Calculate total revenue and platform fees (15% commission)
      const totalRevenue = approvedCompletions.reduce((sum, c) => sum + Number(c.earnings || 0), 0);
      const platformFees = totalRevenue * 0.15;

      // Mock monthly growth for demo
      const monthlyGrowth = 23;

      const stats = {
        totalUsers,
        activeUsers,
        totalTasks: tasks.length,
        pendingApprovals,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        platformFees: Math.round(platformFees * 100) / 100,
        monthlyGrowth
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch platform statistics' });
    }
  });

  // Admin - Pending Task Approvals
  app.get('/api/admin/pending-tasks', isAdmin, async (req, res) => {
    try {
      const completions = await storage.getAllTaskCompletions();
      const tasks = await storage.getAllTasks();
      const users = await storage.getAllUsers();

      const pendingTasks = completions
        .filter(c => c.status === 'pending')
        .map(completion => {
          const task = tasks.find(t => t.id === completion.taskId);
          const user = users.find(u => u.id === completion.userId);
          
          return {
            id: completion.id,
            taskId: completion.taskId,
            userId: completion.userId,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            taskTitle: task?.title || 'Unknown Task',
            status: completion.status,
            earnings: Number(completion.earnings || 0),
            submissionNotes: completion.submissionNotes || '',
            proofFiles: completion.proofFiles || [],
            completedAt: completion.completedAt
          };
        });

      res.json(pendingTasks);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      res.status(500).json({ message: 'Failed to fetch pending tasks' });
    }
  });

  // Admin - Approve/Reject Task
  app.post('/api/admin/approve-task', isAdmin, async (req, res) => {
    try {
      const { taskId, approved, notes } = req.body;
      
      const status = approved ? 'approved' : 'rejected';
      await storage.updateTaskCompletionStatus(taskId, status, notes);

      // If approved, you could also update user earnings here
      if (approved) {
        const completion = await storage.getTaskCompletion(taskId);
        if (completion) {
          await storage.updateUserEarnings(completion.userId, Number(completion.earnings || 0));
        }
      }

      res.json({ success: true, status });
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ message: 'Failed to update task status' });
    }
  });

  // Admin - User Management
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const completions = await storage.getAllTaskCompletions();

      const userStats = users.map(user => {
        const userCompletions = completions.filter(c => c.userId === user.id);
        const approvedCompletions = userCompletions.filter(c => c.status === 'approved');
        const totalEarnings = approvedCompletions.reduce((sum, c) => sum + Number(c.earnings || 0), 0);

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          earnings: Math.round(totalEarnings * 100) / 100,
          completedTasks: approvedCompletions.length,
          rating: Number(user.rating || 4.5),
          joinedAt: user.createdAt,
          verified: user.isEmailVerified || false,
          status: user.accountLocked ? 'suspended' : 'active'
        };
      });

      res.json(userStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Admin - Manage User (suspend, activate, verify)
  app.post('/api/admin/manage-user', isAdmin, async (req, res) => {
    try {
      const { userId, action } = req.body;

      switch (action) {
        case 'suspend':
          await storage.updateUserStatus(userId, { accountLocked: true });
          break;
        case 'activate':
          await storage.updateUserStatus(userId, { accountLocked: false });
          break;
        case 'verify':
          await storage.updateUserStatus(userId, { isEmailVerified: true });
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      res.json({ success: true, action });
    } catch (error) {
      console.error('Error managing user:', error);
      res.status(500).json({ message: 'Failed to manage user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

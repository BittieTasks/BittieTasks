import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskCompletionSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (mock authentication)
  app.get("/api/user/current", async (req, res) => {
    try {
      // In a real app, this would get the user from session/JWT
      const users = await storage.getTaskCategories(); // Get any user for demo
      const user = Array.from(await storage["users"].values())[0]; // Access the first user
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
      const { submissionNotes, userId } = req.body;
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Handle uploaded files
      const proofFiles = req.files ? 
        (req.files as Express.Multer.File[]).map(file => file.filename) : [];

      const completionData = {
        taskId,
        userId: userId || "default-user-id", // In real app, get from auth
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

  // Get user achievements
  app.get("/api/user/:userId/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
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

  const httpServer = createServer(app);
  return httpServer;
}

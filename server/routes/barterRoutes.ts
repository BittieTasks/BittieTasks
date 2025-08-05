import type { Express } from "express";
import { storage } from "../storage";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tasks, barterTransactions } from "@shared/schema";

// Create validation schemas
const createBarterTaskSchema = createInsertSchema(tasks).extend({
  paymentType: z.literal("barter"),
  taskType: z.literal("barter"),
  barterOffered: z.string().min(1, "Please describe what you're offering"),
  barterWanted: z.string().min(1, "Please describe what you want in return"),
  estimatedValue: z.number().min(0, "Estimated value must be positive"),
  barterCategory: z.enum(["skill", "service", "item", "time"]),
  flexibleBarter: z.boolean().default(true)
});

const createBarterTransactionSchema = createInsertSchema(barterTransactions).omit({
  id: true,
  createdAt: true
});

export function registerBarterRoutes(app: Express) {
  // Get all available barter tasks
  app.get("/api/tasks/barter", async (req, res) => {
    try {
      const barterTasks = await storage.getBarterTasks();
      res.json(barterTasks);
    } catch (error) {
      console.error("Error fetching barter tasks:", error);
      res.status(500).json({ message: "Failed to fetch barter tasks" });
    }
  });

  // Create a new barter task
  app.post("/api/tasks/barter", async (req, res) => {
    try {
      const validatedData = createBarterTaskSchema.parse(req.body);
      
      // Add default values for required task fields
      const taskData = {
        ...validatedData,
        payment: null, // No monetary payment for barter tasks
        categoryId: "barter", // We'll need to ensure this category exists
        difficulty: validatedData.difficulty || "Medium"
      };

      const newTask = await storage.createBarterTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating barter task:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create barter task" });
      }
    }
  });

  // Create a barter transaction (proposal)
  app.post("/api/barter-transactions", async (req, res) => {
    try {
      const validatedData = createBarterTransactionSchema.parse({
        ...req.body,
        status: "proposed"
      });

      const newTransaction = await storage.createBarterTransaction(validatedData);
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating barter transaction:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create barter transaction" });
      }
    }
  });

  // Get user's barter transactions
  app.get("/api/barter-transactions/my", async (req, res) => {
    try {
      const userId = req.user?.id; // Assumes user is attached to request by auth middleware
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const transactions = await storage.getUserBarterTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user barter transactions:", error);
      res.status(500).json({ message: "Failed to fetch barter transactions" });
    }
  });

  // Update barter transaction status
  app.patch("/api/barter-transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, agreementTerms, deliveryDate } = req.body;
      
      const updatedTransaction = await storage.updateBarterTransaction(id, {
        status,
        agreementTerms,
        deliveryDate,
        ...(status === "accepted" && { acceptedAt: new Date() }),
        ...(status === "completed" && { completedAt: new Date() })
      });

      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating barter transaction:", error);
      res.status(500).json({ message: "Failed to update barter transaction" });
    }
  });

  // Add barter category if it doesn't exist
  app.post("/api/init-barter-category", async (req, res) => {
    try {
      await storage.ensureBarterCategory();
      res.json({ message: "Barter category initialized" });
    } catch (error) {
      console.error("Error initializing barter category:", error);
      res.status(500).json({ message: "Failed to initialize barter category" });
    }
  });
}
import type { Express } from "express";
import { storage } from "../storage";

export function registerSubscriptionRoutes(app: Express) {
  // Get subscription plans
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = [
        {
          id: "free",
          name: "TaskParent Free",
          price: 0,
          monthlyTaskLimit: 5,
          platformFee: 0.10,
          features: ["5 tasks/month", "Basic support", "Standard fees"]
        },
        {
          id: "pro",
          name: "TaskParent Pro",
          price: 9.99,
          monthlyTaskLimit: 50,
          platformFee: 0.07,
          features: ["50 tasks/month", "Priority support", "Reduced fees", "Ad-free"]
        },
        {
          id: "premium",
          name: "TaskParent Premium",
          price: 19.99,
          monthlyTaskLimit: -1, // unlimited
          platformFee: 0.05,
          features: ["Unlimited tasks", "Premium support", "Lowest fees", "Exclusive tasks"]
        }
      ];
      
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Upgrade subscription
  app.post('/api/subscription/upgrade', async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = (req as any).session?.userId || "demo-user-id";

      if (!planId || !["free", "pro", "premium"].includes(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update subscription
      const updates: any = {
        subscriptionTier: planId,
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        prioritySupport: planId !== "free",
        adFree: planId !== "free",
        premiumBadge: planId === "premium"
      };

      // Set task limits based on plan
      if (planId === "free") {
        updates.monthlyTaskLimit = 5;
      } else if (planId === "pro") {
        updates.monthlyTaskLimit = 50;
      } else if (planId === "premium") {
        updates.monthlyTaskLimit = 999; // Effectively unlimited
      }

      const updatedUser = await storage.updateUser(userId, updates);
      
      res.json({
        message: "Subscription updated successfully",
        user: updatedUser,
        plan: planId
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Check task limits
  app.get('/api/subscription/task-limits/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentMonth = new Date().getMonth();
      const lastResetMonth = user.lastMonthlyReset ? new Date(user.lastMonthlyReset).getMonth() : -1;

      // Reset monthly count if it's a new month
      if (currentMonth !== lastResetMonth) {
        await storage.updateUser(userId, {
          monthlyTasksCompleted: 0,
          lastMonthlyReset: new Date()
        });
        user.monthlyTasksCompleted = 0;
      }

      const canCompleteTask = user.subscriptionTier === "premium" || 
                             (user.monthlyTasksCompleted || 0) < (user.monthlyTaskLimit || 5);

      res.json({
        tier: user.subscriptionTier || "free",
        monthlyLimit: user.monthlyTaskLimit || 5,
        completed: user.monthlyTasksCompleted || 0,
        remaining: user.subscriptionTier === "premium" ? "unlimited" : 
                  Math.max(0, (user.monthlyTaskLimit || 5) - (user.monthlyTasksCompleted || 0)),
        canCompleteTask,
        platformFee: user.subscriptionTier === "premium" ? 0.05 : 
                    user.subscriptionTier === "pro" ? 0.07 : 0.10
      });
    } catch (error) {
      console.error("Error checking task limits:", error);
      res.status(500).json({ message: "Failed to check task limits" });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', async (req, res) => {
    try {
      const userId = (req as any).session?.userId || "demo-user-id";
      
      const updatedUser = await storage.updateUser(userId, {
        subscriptionTier: "free",
        subscriptionStatus: "cancelled",
        monthlyTaskLimit: 5,
        prioritySupport: false,
        adFree: false,
        premiumBadge: false
      });

      res.json({
        message: "Subscription cancelled successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
}
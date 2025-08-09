import type { Express } from "express";
// Note: Using Supabase authentication - storage removed

export function registerSubscriptionRoutes(app: Express) {
  // Get subscription plans
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = [
        {
          id: "free",
          name: "BittieTasks Free",
          price: 0,
          monthlyTaskLimit: 5,
          platformFee: 0.10,
          features: ["5 tasks/month", "Basic support", "Standard fees"]
        },
        {
          id: "pro",
          name: "BittieTasks Pro",
          price: 9.99,
          monthlyTaskLimit: 50,
          platformFee: 0.07,
          features: ["50 tasks/month", "Priority support", "Reduced fees", "Ad-free"]
        },
        {
          id: "premium",
          name: "BittieTasks Premium",
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

      // For demo user, always work regardless of session
      if (userId === "demo-user-id") {
        const demoSubscriptionInfo = {
          subscriptionTier: planId,
          subscriptionStatus: "active",
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          prioritySupport: planId !== "free",
          adFree: planId !== "free",
          premiumBadge: planId === "premium",
          monthlyTaskLimit: planId === "free" ? 5 : planId === "pro" ? 50 : 999,
          monthlyTasksCompleted: 3
        };

        // Store in session for demo purposes (initialize session if needed)
        if (!req.session) {
          (req as any).session = {};
        }
        (req as any).session.demoSubscription = demoSubscriptionInfo;

        console.log("Demo subscription upgrade:", demoSubscriptionInfo);

        return res.json({
          message: "Subscription updated successfully",
          user: { ...demoSubscriptionInfo },
          plan: planId,
          savings: planId === "pro" ? "Save 3% on platform fees" : planId === "premium" ? "Save 5% on platform fees" : null
        });
      }

      // Regular user handling
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update subscription
      const updates: any = {
        subscriptionTier: planId,
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
        updates.monthlyTaskLimit = 999;
      }

      if (storage.updateUser) {
        const updatedUser = await storage.updateUser(userId, updates);
        res.json({
          message: "Subscription updated successfully",
          user: updatedUser,
          plan: planId
        });
      } else {
        res.json({
          message: "Subscription updated successfully (demo mode)",
          plan: planId
        });
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Check task limits
  app.get('/api/subscription/task-limits/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // For demo user, always return demo data regardless of session
      if (userId === "demo-user-id") {
        const demoSubscription = (req as any).session?.demoSubscription || {
          subscriptionTier: "free",
          monthlyTaskLimit: 5,
          monthlyTasksCompleted: 3
        };

        const canCompleteTask = demoSubscription.subscriptionTier === "premium" || 
                               (demoSubscription.monthlyTasksCompleted || 0) < (demoSubscription.monthlyTaskLimit || 5);

        console.log("Demo subscription data:", demoSubscription);

        return res.json({
          tier: demoSubscription.subscriptionTier || "free",
          monthlyLimit: demoSubscription.monthlyTaskLimit || 5,
          completed: demoSubscription.monthlyTasksCompleted || 3,
          remaining: demoSubscription.subscriptionTier === "premium" ? "unlimited" : 
                    Math.max(0, (demoSubscription.monthlyTaskLimit || 5) - (demoSubscription.monthlyTasksCompleted || 3)),
          canCompleteTask,
          platformFee: demoSubscription.subscriptionTier === "premium" ? 0.05 : 
                      demoSubscription.subscriptionTier === "pro" ? 0.07 : 0.10
        });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentMonth = new Date().getMonth();
      const lastResetMonth = user.lastMonthlyReset ? new Date(user.lastMonthlyReset).getMonth() : -1;

      // Reset monthly count if it's a new month
      if (currentMonth !== lastResetMonth && storage.updateUser) {
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
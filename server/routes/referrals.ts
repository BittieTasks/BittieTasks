import type { Express } from "express";
// Note: Using Supabase authentication - storage removed
import { randomBytes } from "crypto";

export function registerReferralRoutes(app: Express) {
  // Generate referral code for user
  app.post('/api/referrals/generate-code', async (req, res) => {
    try {
      const userId = (req as any).session?.userId || "demo-user-id";
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Generate unique referral code (6 characters)
      const referralCode = randomBytes(3).toString('hex').toUpperCase();
      
      // For demo user, store in session
      if (userId === "demo-user-id") {
        (req as any).session.demoReferralCode = referralCode;
        return res.json({ 
          referralCode,
          referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`,
          message: "Referral code generated successfully"
        });
      }

      // Update user with referral code
      if (storage.updateUser) {
        await storage.updateUser(userId, { referralCode });
      }

      res.json({
        referralCode,
        referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`,
        message: "Referral code generated successfully"
      });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  // Get user's referral stats
  app.get('/api/referrals/stats', async (req, res) => {
    try {
      const userId = (req as any).session?.userId || "demo-user-id";
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // For demo user, return demo stats
      if (userId === "demo-user-id") {
        const demoReferralCode = (req as any).session?.demoReferralCode || "DEMO123";
        return res.json({
          referralCode: demoReferralCode,
          referralCount: 3,
          totalEarnings: "30.00",
          pendingReferrals: 1,
          completedReferrals: 2,
          referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${demoReferralCode}`,
          recentReferrals: [
            { name: "Sarah M.", status: "completed", reward: "10.00", date: "2024-01-20" },
            { name: "Mike T.", status: "completed", reward: "10.00", date: "2024-01-18" },
            { name: "Jenny L.", status: "pending", reward: "10.00", date: "2024-01-22" }
          ]
        });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get referral stats (would normally query referrals table)
      res.json({
        referralCode: user.referralCode || null,
        referralCount: user.referralCount || 0,
        totalEarnings: user.referralEarnings || "0.00",
        pendingReferrals: 0,
        completedReferrals: user.referralCount || 0,
        referralLink: user.referralCode ? `${req.protocol}://${req.get('host')}/signup?ref=${user.referralCode}` : null,
        recentReferrals: []
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Validate referral code during signup
  app.post('/api/referrals/validate', async (req, res) => {
    try {
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code required" });
      }

      // For demo purposes, accept any code
      if (referralCode.length === 6) {
        return res.json({
          valid: true,
          referrerName: "Demo Referrer",
          newUserBonus: "5.00",
          message: "Valid referral code! You'll get $5 bonus after your first task."
        });
      }

      // In real implementation, would check database for valid referral code
      res.json({
        valid: false,
        message: "Invalid referral code"
      });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  // Process referral reward when new user completes first task
  app.post('/api/referrals/complete', async (req, res) => {
    try {
      const { referredUserId } = req.body;
      
      if (!referredUserId) {
        return res.status(400).json({ message: "Referred user ID required" });
      }

      // For demo purposes, simulate successful referral completion
      res.json({
        message: "Referral completed successfully",
        referrerReward: "10.00",
        referredReward: "5.00"
      });
    } catch (error) {
      console.error("Error completing referral:", error);
      res.status(500).json({ message: "Failed to complete referral" });
    }
  });

  // Get referral leaderboard
  app.get('/api/referrals/leaderboard', async (req, res) => {
    try {
      // Demo leaderboard data
      const leaderboard = [
        { name: "Sarah M.", referrals: 15, earnings: "150.00", badge: "Top Referrer" },
        { name: "Mike T.", referrals: 12, earnings: "120.00", badge: "Super Referrer" },
        { name: "Jenny L.", referrals: 8, earnings: "80.00", badge: "Active Referrer" },
        { name: "You (Demo)", referrals: 3, earnings: "30.00", badge: "Getting Started" },
        { name: "Tom R.", referrals: 2, earnings: "20.00", badge: "New Referrer" }
      ];

      res.json({
        leaderboard,
        yourRank: 4,
        nextMilestone: { referrals: 5, badge: "Active Referrer", bonus: "25.00" }
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
}
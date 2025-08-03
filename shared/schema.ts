import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  totalEarnings: decimal("total_earnings").default("0.00"),
  rating: decimal("rating").default("0.00"),
  completedTasks: integer("completed_tasks").default(0),
  currentStreak: integer("current_streak").default(0),
  skills: text("skills").array().default([]),
  availability: jsonb("availability"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  isIdentityVerified: boolean("is_identity_verified").default(false),
  isBackgroundChecked: boolean("is_background_checked").default(false),
  phoneNumber: text("phone_number"),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationExpires: timestamp("phone_verification_expires"),
  identityDocuments: text("identity_documents").array().default([]),
  trustScore: integer("trust_score").default(0),
  riskScore: integer("risk_score").default(0),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLocked: boolean("account_locked").default(false),
  lockUntil: timestamp("lock_until"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  // Subscription fields
  subscriptionTier: text("subscription_tier").default("free"), // free, pro, premium
  subscriptionStatus: text("subscription_status").default("active"), // active, cancelled, expired
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  monthlyTaskLimit: integer("monthly_task_limit").default(5), // Free tier limit
  monthlyTasksCompleted: integer("monthly_tasks_completed").default(0),
  lastMonthlyReset: timestamp("last_monthly_reset").default(sql`CURRENT_TIMESTAMP`),
  prioritySupport: boolean("priority_support").default(false),
  adFree: boolean("ad_free").default(false),
  premiumBadge: boolean("premium_badge").default(false),
  // Referral fields
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"), // referral code of the person who referred them
  referralCount: integer("referral_count").default(0),
  referralEarnings: decimal("referral_earnings").default("0.00")
});

export const taskCategories = pgTable("task_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description")
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").references(() => taskCategories.id),
  payment: decimal("payment").notNull(),
  duration: integer("duration_minutes"),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  requirements: text("requirements").array().default([]),
  imageUrl: text("image_url"),
  rating: decimal("rating").default("0.00"),
  completions: integer("completions").default(0),
  isActive: boolean("is_active").default(true),
  taskType: text("task_type").notNull().default("shared"), // shared, sponsored, community
  sponsorInfo: jsonb("sponsor_info"), // For sponsored tasks - {brandName, brandLogo, brandColor, specialReward}
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull(), // pending, approved, rejected
  submissionNotes: text("submission_notes"),
  proofFiles: text("proof_files").array().default([]),
  reviewNotes: text("review_notes"),
  rating: integer("rating"),
  earnings: decimal("earnings"),
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`)
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  achievementType: text("achievement_type").notNull(), // wellness_streak, self_care_champion, community_builder, etc.
  achievementData: jsonb("achievement_data"), // badge details, progress, unlock criteria
  earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`),
  isVisible: boolean("is_visible").default(true), // user can hide/show badges
  progress: integer("progress").default(0), // current progress toward achievement
  maxProgress: integer("max_progress").default(1) // total needed to unlock
});

export const achievementDefinitions = pgTable("achievement_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(), // wellness_streak_7, self_care_warrior, etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon class
  color: text("color").notNull(), // badge color theme
  category: text("category").notNull(), // wellness, community, earnings, etc.
  criteria: jsonb("criteria").notNull(), // unlock requirements
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  rewardPoints: integer("reward_points").default(0), // bonus points for earning badge
  isActive: boolean("is_active").default(true)
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // wellness, productivity, social, mindfulness
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  rewardPoints: integer("reward_points").default(5),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  estimatedMinutes: integer("estimated_minutes").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  challengeId: varchar("challenge_id").references(() => dailyChallenges.id),
  assignedDate: timestamp("assigned_date").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("assigned"), // assigned, completed, skipped
  reflection: text("reflection"), // user's reflection on completing the challenge
  pointsEarned: integer("points_earned").default(0)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertTaskCategorySchema = createInsertSchema(taskCategories).omit({
  id: true
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true
});

export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions).omit({
  id: true
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  assignedDate: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerUserId: text("referrer_user_id").references(() => users.id),
  referredUserId: text("referred_user_id").references(() => users.id),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, paid
  referrerReward: decimal("referrer_reward").default("10.00"), // $10 bonus for referrer
  referredReward: decimal("referred_reward").default("5.00"), // $5 bonus for new user
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"), // when referred user completes first task
});

export const insertReferralSchema = createInsertSchema(referrals);
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertTaskCategory = z.infer<typeof insertTaskCategorySchema>;
export type TaskCategory = typeof taskCategories.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertAchievementDefinition = z.infer<typeof insertAchievementDefinitionSchema>;
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;

export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

// Affiliate Products table for brand integrations in tasks
export const affiliateProducts = pgTable("affiliate_products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  affiliateUrl: varchar("affiliate_url", { length: 500 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task-Product relationships for affiliate marketing
export const taskProducts = pgTable("task_products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => affiliateProducts.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateProductSchema = createInsertSchema(affiliateProducts).omit({
  id: true,
  createdAt: true
});

export const insertTaskProductSchema = createInsertSchema(taskProducts).omit({
  id: true,
  createdAt: true
});

export type InsertAffiliateProduct = z.infer<typeof insertAffiliateProductSchema>;
export type AffiliateProduct = typeof affiliateProducts.$inferSelect;
export type InsertTaskProduct = z.infer<typeof insertTaskProductSchema>;
export type TaskProduct = typeof taskProducts.$inferSelect;

// User activity tracking for fraud prevention
export const userActivity = pgTable("user_activity", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityType: text("activity_type").notNull(), // login, task_creation, payment, message, etc.
  metadata: jsonb("metadata"), // IP, user agent, additional data
  riskScore: integer("risk_score").default(0),
  flagged: boolean("flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Identity verification documents
export const verificationDocuments = pgTable("verification_documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  documentType: text("document_type").notNull(), // drivers_license, passport, utility_bill, etc.
  documentUrl: text("document_url").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  verificationNotes: text("verification_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
});

// Trust and safety reports
export const safetyReports = pgTable("safety_reports", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reporterUserId: varchar("reporter_user_id").references(() => users.id).notNull(),
  reportedUserId: varchar("reported_user_id").references(() => users.id).notNull(),
  reportType: text("report_type").notNull(), // fraud, harassment, inappropriate_behavior, etc.
  description: text("description").notNull(),
  evidence: text("evidence").array().default([]), // URLs to uploaded evidence
  status: text("status").notNull().default("pending"), // pending, investigating, resolved, dismissed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  assignedTo: varchar("assigned_to"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  createdAt: true
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  submittedAt: true
});

export const insertSafetyReportSchema = createInsertSchema(safetyReports).omit({
  id: true,
  createdAt: true
});

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;
export type SafetyReport = typeof safetyReports.$inferSelect;

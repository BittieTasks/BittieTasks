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
  identityScore: integer("identity_score").default(0), // Overall human verification score 0-100
  // Enhanced Human Verification
  isCaptchaVerified: boolean("is_captcha_verified").default(false),
  captchaScore: decimal("captcha_score").default("0.0"), // reCAPTCHA score 0.0-1.0
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signupMethod: text("signup_method").default("email"), // email, phone, google, facebook
  behaviorScore: integer("behavior_score").default(0), // AI-analyzed behavior patterns
  lastCaptchaVerification: timestamp("last_captcha_verification"),
  // Identity Verification Requirements
  governmentIdUploaded: boolean("government_id_uploaded").default(false),
  governmentIdVerified: boolean("government_id_verified").default(false),
  faceVerificationCompleted: boolean("face_verification_completed").default(false),
  livelinessCheckPassed: boolean("liveliness_check_passed").default(false),
  // Anti-Bot Measures  
  mouseMovementAnalyzed: boolean("mouse_movement_analyzed").default(false),
  keystrokePatternAnalyzed: boolean("keystroke_pattern_analyzed").default(false),
  sessionBehaviorScore: integer("session_behavior_score").default(0),
  humanVerificationLevel: text("human_verification_level").default("basic"), // basic, standard, premium
  // Two-Factor Authentication
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  backupCodes: text("backup_codes").array().default([]),
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
  referralEarnings: decimal("referral_earnings").default("0.00"),
  // Ad Preference Settings
  adFrequency: integer("ad_frequency").default(5), // 1-10 scale: how often to show ads
  adRelevance: integer("ad_relevance").default(7), // 1-10 scale: how targeted ads should be
  adTypes: text("ad_types").array().default(sql`ARRAY['native_feed', 'sponsored_task']`), // preferred ad types
  adCategories: text("ad_categories").array().default(sql`ARRAY['education', 'health-wellness', 'retail']`), // preferred categories
  maxAdBudget: integer("max_ad_budget").default(100), // max budget range to show ads from
  minAdBudget: integer("min_ad_budget").default(10), // min budget range to show ads from
  familyFriendlyOnly: boolean("family_friendly_only").default(true), // only family-friendly content
  localAdsOnly: boolean("local_ads_only").default(false), // prefer local businesses
  ethicalAdsOnly: boolean("ethical_ads_only").default(true), // only ethically approved advertisers
  adPersonalization: boolean("ad_personalization").default(true) // use personal data for targeting
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
  payment: decimal("payment"),
  duration: integer("duration_minutes"),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  requirements: text("requirements").array().default([]),
  imageUrl: text("image_url"),
  rating: decimal("rating").default("0.00"),
  completions: integer("completions").default(0),
  isActive: boolean("is_active").default(true),
  taskType: text("task_type").notNull().default("shared"), // shared, sponsored, community, barter, solo
  sponsorInfo: jsonb("sponsor_info"), // For sponsored tasks - {brandName, brandLogo, brandColor, specialReward}
  // Barter-specific fields
  paymentType: text("payment_type").notNull().default("cash"), // cash, barter, both
  barterOffered: text("barter_offered"), // What the task creator is offering in exchange
  barterWanted: text("barter_wanted"), // What the task creator wants in return
  estimatedValue: decimal("estimated_value"), // Fair market value for tax purposes
  barterCategory: text("barter_category"), // skill, service, item, time
  // Self-care specific fields
  allowAccountabilityPartners: boolean("allow_accountability_partners").default(false), // Can invite others to join for support
  maxPartners: integer("max_partners").default(3), // Maximum number of accountability partners
  partnerPayment: decimal("partner_payment").default("0.00"), // How much each partner earns for joining
  flexibleBarter: boolean("flexible_barter").default(false), // Open to barter negotiation
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
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  paymentStatus: text("payment_status").default("pending"), // pending, processing, completed, failed
  platformFee: decimal("platform_fee"), // Fee taken by BittieTasks
  netEarnings: decimal("net_earnings"), // Earnings after platform fee
  // Barter-specific fields
  isBarterTransaction: boolean("is_barter_transaction").default(false),
  barterValue: decimal("barter_value"), // Fair market value for tax reporting
  barterDescription: text("barter_description"), // What was actually traded
  barterAgreement: jsonb("barter_agreement"), // Terms of the barter exchange
  taxFormRequired: boolean("tax_form_required").default(false), // IRS 1099-B requirement
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`)
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentIntentId: text("payment_intent_id").notNull().unique(),
  taskCompletionId: varchar("task_completion_id").references(() => taskCompletions.id),
  payerId: varchar("payer_id").references(() => users.id), // User paying for the task
  payeeId: varchar("payee_id").references(() => users.id), // User receiving payment
  amount: decimal("amount").notNull(), // Total amount paid
  platformFee: decimal("platform_fee").notNull(), // BittieTasks fee
  netAmount: decimal("net_amount").notNull(), // Amount to payee after fees
  status: text("status").notNull(), // pending, processing, completed, failed, refunded
  stripeChargeId: text("stripe_charge_id"),
  stripeTransferId: text("stripe_transfer_id"),
  paymentMethod: text("payment_method"), // card, bank_transfer, etc.
  currency: text("currency").default("usd"),
  metadata: jsonb("metadata"), // Additional payment data
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  processedAt: timestamp("processed_at")
});

export const escrowTransactions = pgTable("escrow_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskCompletionId: varchar("task_completion_id").references(() => taskCompletions.id),
  escrowTransactionId: text("escrow_transaction_id").notNull(), // Escrow.com transaction ID
  buyerId: varchar("buyer_id").references(() => users.id),
  sellerId: varchar("seller_id").references(() => users.id),
  amount: decimal("amount").notNull(),
  status: text("status").notNull(), // pending, funded, inspection, completed, disputed, cancelled
  inspectionPeriod: integer("inspection_period_days").default(3),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at")
});

// Accountability partnerships for self-care tasks
export const accountabilityPartnerships = pgTable("accountability_partnerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id),
  taskCompletionId: varchar("task_completion_id").references(() => taskCompletions.id),
  creatorId: varchar("creator_id").references(() => users.id), // Person who created the self-care task
  partnerId: varchar("partner_id").references(() => users.id), // Person providing accountability support
  status: text("status").notNull().default("pending"), // pending, accepted, completed, cancelled
  supportType: text("support_type").default("encouragement"), // encouragement, photo_check, progress_tracking
  partnerEarnings: decimal("partner_earnings").default("0.00"),
  supportNotes: text("support_notes"), // Partner's notes on providing support
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
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

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions).omit({
  id: true,
  createdAt: true
});

// Type exports
export type SelectUser = typeof users.$inferSelect;
export type SelectTask = typeof tasks.$inferSelect;
export type SelectTaskCompletion = typeof taskCompletions.$inferSelect;
export type SelectPayment = typeof payments.$inferSelect;
export type SelectEscrowTransaction = typeof escrowTransactions.$inferSelect;
export type SelectMessage = typeof messages.$inferSelect;

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

// Additional tables for comprehensive verification system
export const userActivity = pgTable("user_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  metadata: jsonb("metadata"),
  riskScore: integer("risk_score").default(0),
  flagged: boolean("flagged").default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const verificationDocuments = pgTable("verification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  documentType: text("document_type").notNull(), // drivers_license, passport, etc.
  documentUrl: text("document_url").notNull(),
  verificationStatus: text("verification_status").default("pending"), // pending, approved, rejected
  verificationNotes: text("verification_notes"),
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
  verifiedAt: timestamp("verified_at")
});

export const safetyReports = pgTable("safety_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterUserId: varchar("reporter_user_id").references(() => users.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  reportType: text("report_type").notNull(), // fraud, harassment, etc.
  description: text("description").notNull(),
  evidence: text("evidence").array().default([]),
  status: text("status").default("pending"), // pending, investigating, resolved
  priority: text("priority").default("medium"), // low, medium, high, critical
  resolution: text("resolution"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: timestamp("resolved_at")
});



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

export const insertAffiliateProductSchema = createInsertSchema(affiliateProducts);

export const insertTaskProductSchema = createInsertSchema(taskProducts);

export type InsertAffiliateProduct = z.infer<typeof insertAffiliateProductSchema>;
export type AffiliateProduct = typeof affiliateProducts.$inferSelect;

// Barter Transactions table for non-monetary exchanges
export const barterTransactions = pgTable("barter_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id),
  taskCompletionId: varchar("task_completion_id").references(() => taskCompletions.id),
  offererId: varchar("offerer_id").references(() => users.id), // Person offering the task
  accepterId: varchar("accepter_id").references(() => users.id), // Person accepting the barter
  offeredService: text("offered_service").notNull(), // What the offerer is providing
  requestedService: text("requested_service").notNull(), // What the offerer wants in return
  agreedValue: decimal("agreed_value").notNull(), // Fair market value for tax purposes
  status: text("status").notNull().default("proposed"), // proposed, accepted, in_progress, completed, cancelled, disputed
  negotiationHistory: jsonb("negotiation_history"), // Array of negotiation messages
  agreementTerms: jsonb("agreement_terms"), // Detailed terms of the barter
  deliveryDate: timestamp("delivery_date"), // When the barter exchange should occur
  completionProof: text("completion_proof").array().default([]), // Photos/documents of completion
  mutualRating: boolean("mutual_rating").default(false), // Both parties have rated
  taxReportingRequired: boolean("tax_reporting_required").default(false), // Based on value threshold
  platformFeeType: text("platform_fee_type").default("percentage"), // percentage, flat, none
  platformFeeAmount: decimal("platform_fee_amount").default("0.00"), // Fee charged by platform
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at")
});

export const insertBarterTransactionSchema = createInsertSchema(barterTransactions).omit({
  id: true,
  createdAt: true
});

export type InsertBarterTransaction = z.infer<typeof insertBarterTransactionSchema>;
export type BarterTransaction = typeof barterTransactions.$inferSelect;
export type InsertTaskProduct = z.infer<typeof insertTaskProductSchema>;
export type TaskProduct = typeof taskProducts.$inferSelect;

// Accountability partnership schema and types
export const insertAccountabilityPartnershipSchema = createInsertSchema(accountabilityPartnerships).omit({
  id: true,
  createdAt: true
});

export type InsertAccountabilityPartnership = z.infer<typeof insertAccountabilityPartnershipSchema>;
export type AccountabilityPartnership = typeof accountabilityPartnerships.$inferSelect;

// Duplicate tables removed - using original definitions above

// Schema types already defined above with original table definitions

// Corporate Partners and Sponsorship Tables
export const corporatePartners = pgTable("corporate_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactName: text("contact_name").notNull(),
  website: text("website").notNull(),
  industry: text("industry").notNull(),
  approvalTier: text("approval_tier").notNull(), // premium, standard, basic
  ethicalScore: integer("ethical_score").notNull(),
  monthlyBudget: decimal("monthly_budget").notNull(),
  taskTypes: text("task_types").array().default([]),
  isActive: boolean("is_active").default(true),
  partnerSince: timestamp("partner_since").default(sql`CURRENT_TIMESTAMP`),
  totalSpent: decimal("total_spent").default("0.00"),
  tasksCreated: integer("tasks_created").default(0),
  averageRating: decimal("average_rating").default("0.00"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const sponsorshipApplications = pgTable("sponsorship_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactName: text("contact_name").notNull(),
  website: text("website").notNull(),
  industry: text("industry").notNull(),
  companySize: text("company_size").notNull(),
  monthlyBudget: decimal("monthly_budget").notNull(),
  taskTypes: text("task_types").array().default([]),
  targetAudience: text("target_audience").notNull(),
  ethicalScore: integer("ethical_score").notNull(),
  approvalTier: text("approval_tier").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  applicationData: jsonb("application_data"),
  submittedAt: timestamp("submitted_at").default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes")
});

export const ethicalEvaluations = pgTable("ethical_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => sponsorshipApplications.id),
  hrcScore: integer("hrc_score"), // HRC Corporate Equality Index score
  deiLeadership: boolean("dei_leadership").default(false),
  lgbtqSupport: boolean("lgbtq_support").default(false),
  environmentalPractices: text("environmental_practices"),
  laborStandards: text("labor_standards"),
  familySafetyCompliance: boolean("family_safety_compliance").default(false),
  dataPrivacyCompliance: boolean("data_privacy_compliance").default(false),
  overallScore: integer("overall_score").notNull(),
  evaluatedAt: timestamp("evaluated_at").default(sql`CURRENT_TIMESTAMP`),
  evaluatedBy: text("evaluated_by")
});

export const sponsoredTasks = pgTable("sponsored_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").references(() => corporatePartners.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  payment: decimal("payment").notNull(), // What each participant earns
  platformFee: decimal("platform_fee").notNull(), // Our fee per participant
  totalBudget: decimal("total_budget").notNull(), // Total cost to company
  duration: integer("duration_minutes").notNull(),
  categoryId: varchar("category_id").references(() => taskCategories.id),
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  requirements: text("requirements").array().default([]),
  status: text("status").notNull().default("active"), // active, paused, completed, cancelled
  brandName: text("brand_name").notNull(),
  brandLogo: text("brand_logo"),
  brandColor: text("brand_color"),
  targetAudience: text("target_audience"),
  specialReward: text("special_reward"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const sponsoredTaskParticipations = pgTable("sponsored_task_participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => sponsoredTasks.id),
  userId: varchar("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull().default("active"), // active, completed, dropped
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  completedAt: timestamp("completed_at"),
  earnings: decimal("earnings").notNull(),
  rating: integer("rating"), // 1-5 rating of the task
  feedback: text("feedback")
});

// Insert schemas for sponsorship tables
export const insertCorporatePartnerSchema = createInsertSchema(corporatePartners);
export type InsertCorporatePartner = z.infer<typeof insertCorporatePartnerSchema>;
export type CorporatePartner = typeof corporatePartners.$inferSelect;

export const insertSponsorshipApplicationSchema = createInsertSchema(sponsorshipApplications);
export type InsertSponsorshipApplication = z.infer<typeof insertSponsorshipApplicationSchema>;
export type SponsorshipApplication = typeof sponsorshipApplications.$inferSelect;

export const insertEthicalEvaluationSchema = createInsertSchema(ethicalEvaluations);
export type InsertEthicalEvaluation = z.infer<typeof insertEthicalEvaluationSchema>;
export type EthicalEvaluation = typeof ethicalEvaluations.$inferSelect;

export const insertSponsoredTaskSchema = createInsertSchema(sponsoredTasks);
export type InsertSponsoredTask = z.infer<typeof insertSponsoredTaskSchema>;
export type SponsoredTask = typeof sponsoredTasks.$inferSelect;

export const insertSponsoredTaskParticipationSchema = createInsertSchema(sponsoredTaskParticipations);
export type InsertSponsoredTaskParticipation = z.infer<typeof insertSponsoredTaskParticipationSchema>;
export type SponsoredTaskParticipation = typeof sponsoredTaskParticipations.$inferSelect;

// Type exports (consolidated to avoid duplicates)

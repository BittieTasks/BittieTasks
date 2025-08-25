import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums
export const taskStatusEnum = pgEnum('task_status', ['open', 'active', 'completed', 'cancelled']);
export const taskTypeEnum = pgEnum('task_type', ['shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged']);
export const reviewTierEnum = pgEnum('review_tier', ['auto_approve', 'standard_review', 'enhanced_review', 'corporate_review']);
export const transactionTypeEnum = pgEnum('transaction_type', ['task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);
export const verificationMethodEnum = pgEnum('verification_method', ['photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof']);
export const revenueStreamEnum = pgEnum('revenue_stream', ['peer_to_peer', 'corporate_partnership', 'platform_funded']);

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number").unique().notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  phoneVerified: boolean("phone_verified").default(false),
  verified: boolean("verified").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(true),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default('0.00'),
  tasksCompleted: integer("tasks_completed").default(0),
  activeReferrals: integer("active_referrals").default(0),
  monthlyGoal: decimal("monthly_goal", { precision: 10, scale: 2 }).default('500.00'),
  // Subscription fields
  subscriptionTier: varchar("subscription_tier").default('free'), // free, pro, premium
  subscriptionStatus: varchar("subscription_status").default('active'), // active, cancelled, past_due
  stripeCustomerId: varchar("stripe_customer_id"), // For payment integration
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  monthlyTaskLimit: integer("monthly_task_limit").default(5),
  monthlyTasksCompleted: integer("monthly_tasks_completed").default(0),
  lastMonthlyReset: timestamp("last_monthly_reset"),
  prioritySupport: boolean("priority_support").default(false),
  adFree: boolean("ad_free").default(false),
  premiumBadge: boolean("premium_badge").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Phone verification codes table
export const phoneVerificationCodes = pgTable('phone_verification_codes', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  phoneNumber: varchar('phone_number').notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  attempts: integer('attempts').default(0),
  verified: boolean('verified').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email verification tokens table (now optional for notifications)
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: varchar('user_id').notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Verification tokens table (main table for email verification)
export const verificationTokens = pgTable('verification_tokens', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: varchar('user_id').notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Task categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  type: taskTypeEnum("type").default('shared'),
  status: taskStatusEnum("status").default('open'),
  // Approval system fields
  approvalStatus: approvalStatusEnum("approval_status").default('pending'),
  reviewTier: reviewTierEnum("review_tier").default('standard_review'),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"), // admin user id or 'system' for auto-approval
  rejectionReason: text("rejection_reason"),
  flaggedReason: text("flagged_reason"),
  riskScore: integer("risk_score").default(0), // 0-100 risk assessment score
  // Task details
  earningPotential: decimal("earning_potential", { precision: 8, scale: 2 }).notNull(),
  maxParticipants: integer("max_participants").default(1),
  currentParticipants: integer("current_participants").default(0),
  duration: varchar("duration"),
  location: varchar("location"),
  // Proper location tracking fields
  zipCode: varchar("zip_code"),
  city: varchar("city"),
  state: varchar("state"),
  coordinates: varchar("coordinates"), // "lat,lng" format for distance calculations
  radiusMiles: integer("radius_miles").default(25), // Task visible within this radius
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  requirements: text("requirements"),
  sponsorId: varchar("sponsor_id"),
  sponsorBudget: decimal("sponsor_budget", { precision: 10, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedAt: timestamp("completed_at"),
  // Barter-specific fields
  offering: text("offering"), // What the poster is offering
  seeking: text("seeking"), // What the poster wants in return
  tradeType: varchar("trade_type", { enum: ["service_for_service", "item_for_service", "service_for_item", "item_for_item"] }),
  tags: varchar("tags").array(), // Tags for better discovery
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task participants
export const taskParticipants = pgTable("task_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: varchar("status").default('joined'), // joined, completed, cancelled, expired
  earnedAmount: decimal("earned_amount", { precision: 8, scale: 2 }),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  // Time limit fields
  deadline: timestamp("deadline"),
  reminderSent: boolean("reminder_sent").default(false),
  deadlineExtended: boolean("deadline_extended").default(false),
  extensionRequestedAt: timestamp("extension_requested_at"),
});

// Task verification requirements
export const taskVerificationRequirements = pgTable("task_verification_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  revenueStream: revenueStreamEnum("revenue_stream").notNull(),
  requiredMethods: varchar("required_methods").array().notNull(), // ['photo', 'gps_tracking', 'time_tracking']
  photoRequirements: jsonb("photo_requirements"), // {count: 2, requiresLocation: true, requiresTimestamp: true}
  videoRequirements: jsonb("video_requirements"), // {minDuration: 30, maxDuration: 300, requiresAudio: true}
  locationRequirements: jsonb("location_requirements"), // {radius: 100, specificAddress: "123 Main St"}
  timeRequirements: jsonb("time_requirements"), // {minDuration: 1800, trackingInterval: 60}
  additionalRequirements: text("additional_requirements"),
  autoApprovalCriteria: jsonb("auto_approval_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task completion submissions
export const taskCompletionSubmissions = pgTable("task_completion_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  participantId: varchar("participant_id").references(() => taskParticipants.id).notNull(),
  verificationStatus: verificationStatusEnum("verification_status").default('pending'),
  verificationMethods: verificationMethodEnum("verification_methods").array().notNull(),
  
  // Photo/Video evidence
  photoUrls: varchar("photo_urls").array(),
  videoUrls: varchar("video_urls").array(),
  photoMetadata: jsonb("photo_metadata"), // GPS, timestamp, device info
  videoMetadata: jsonb("video_metadata"), // Duration, resolution, timestamp
  
  // Location verification
  gpsCoordinates: varchar("gps_coordinates").array(), // [lat, lng] for tracking
  locationHistory: jsonb("location_history"), // Full GPS tracking data
  startLocation: varchar("start_location"),
  endLocation: varchar("end_location"),
  
  // Time verification
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  totalDuration: integer("total_duration"), // seconds
  timeTrackingData: jsonb("time_tracking_data"), // Detailed time tracking
  
  // Community verification
  communityVerifications: jsonb("community_verifications"), // User confirmations
  businessVerification: varchar("business_verification"), // Business owner confirmation
  receiptUrls: varchar("receipt_urls").array(),
  socialProofUrls: varchar("social_proof_urls").array(),
  
  // System verification
  autoVerificationScore: integer("auto_verification_score"), // 0-100 confidence
  aiAnalysisResults: jsonb("ai_analysis_results"), // AI content analysis
  fraudDetectionScore: integer("fraud_detection_score"), // 0-100 fraud risk
  qualityScore: integer("quality_score"), // 0-100 submission quality
  
  // Review process
  reviewedBy: varchar("reviewed_by"), // admin user ID or 'system'
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  paymentReleased: boolean("payment_released").default(false),
  paymentReleasedAt: timestamp("payment_released_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User reputation and verification history
export const userVerificationHistory = pgTable("user_verification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  submissionId: varchar("submission_id").references(() => taskCompletionSubmissions.id).notNull(),
  verificationOutcome: verificationStatusEnum("verification_outcome").notNull(),
  qualityScore: integer("quality_score"), // 0-100 submission quality
  fraudScore: integer("fraud_score"), // 0-100 fraud risk
  timeliness: integer("timeliness"), // How quickly they completed
  accuracyScore: integer("accuracy_score"), // How well submission matched requirements
  impactOnReputation: integer("impact_on_reputation"), // +/- reputation change
  createdAt: timestamp("created_at").defaultNow(),
});

// Corporate partner verification settings
export const corporateVerificationSettings = pgTable("corporate_verification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id).notNull(),
  brandComplianceRequired: boolean("brand_compliance_required").default(true),
  contentQualityThreshold: integer("content_quality_threshold").default(80), // 0-100
  manualReviewRequired: boolean("manual_review_required").default(false),
  autoApprovalEnabled: boolean("auto_approval_enabled").default(true),
  maxAutoApprovalAmount: decimal("max_auto_approval_amount", { precision: 8, scale: 2 }).default('100.00'),
  requiredVerificationMethods: verificationMethodEnum("required_verification_methods").array(),
  brandGuidelinesUrl: varchar("brand_guidelines_url"),
  approvalTimeoutHours: integer("approval_timeout_hours").default(24),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  taskId: varchar("task_id").references(() => tasks.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: transactionStatusEnum("status").default('pending'),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon"),
  criteria: jsonb("criteria"), // JSON object defining earning criteria
  reward: decimal("reward", { precision: 8, scale: 2 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress"),
  earned: boolean("earned").default(false),
  earnedAt: timestamp("earned_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id),
  taskId: varchar("task_id").references(() => tasks.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default('text'), // text, system, notification
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced AI-powered task verifications for Phase 3B
export const taskVerifications = pgTable('task_verifications', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar('task_id').references(() => tasks.id).notNull(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  verificationType: varchar('verification_type', { 
    enum: ['ai_photo', 'manual', 'admin'] 
  }).notNull().default('ai_photo'),
  status: varchar('status', { 
    enum: ['pending', 'approved', 'rejected', 'pending_review'] 
  }).notNull().default('pending'),
  aiConfidence: integer('ai_confidence'), // 0-100
  aiReasoning: text('ai_reasoning'),
  aiDetails: jsonb('ai_details').$type<{
    taskCompleted: boolean
    qualityScore: number
    issuesFound: string[]
    positiveAspects: string[]
  }>(),
  beforePhotoUrl: varchar('before_photo_url'),
  afterPhotoUrl: varchar('after_photo_url'),
  verificationNotes: text('verification_notes'),
  adminNotes: text('admin_notes'),
  reviewedBy: varchar('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
});

// Corporate sponsors
export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  logo: varchar("logo"),
  description: text("description"),
  website: varchar("website"),
  contactEmail: varchar("contact_email"),
  ethicsScore: integer("ethics_score"), // 0-100 rating
  approved: boolean("approved").default(false),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  tasksSponsored: integer("tasks_sponsored").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task approval logs
// Payments table for transparent fee tracking
export const payments = pgTable('payments', {
  id: varchar('id').primaryKey(), // Stripe payment intent ID
  taskId: varchar('task_id').references(() => tasks.id),
  userId: varchar('user_id').references(() => users.id),
  amount: varchar('amount').notNull(), // Store as string to avoid decimal precision issues
  platformFee: varchar('platform_fee').notNull(),
  processingFee: varchar('processing_fee').notNull(),
  netAmount: varchar('net_amount').notNull(),
  taskType: varchar('task_type').notNull(), // 'solo', 'community', 'barter', 'corporate'
  status: varchar('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'requires_action'
  stripePaymentIntentId: varchar('stripe_payment_intent_id'),
  stripeChargeId: varchar('stripe_charge_id'),
  feeBreakdown: jsonb('fee_breakdown'), // Detailed fee calculation
  failureReason: varchar('failure_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at')
});

// User earnings tracking for transparent reporting
export const userEarnings = pgTable('user_earnings', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').references(() => users.id).notNull(),
  taskId: varchar('task_id').references(() => tasks.id),
  paymentId: varchar('payment_id').references(() => payments.id),
  amount: varchar('amount').notNull(), // Net amount earned
  taskType: varchar('task_type').notNull(),
  earnedAt: timestamp('earned_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

export const taskApprovalLogs = pgTable("task_approval_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  previousStatus: approvalStatusEnum("previous_status"),
  newStatus: approvalStatusEnum("new_status").notNull(),
  reviewedBy: varchar("reviewed_by"), // admin user id or 'system'
  reviewNotes: text("review_notes"),
  riskFactors: text("risk_factors"), // JSON string of detected risk factors
  automatedChecks: jsonb("automated_checks"), // Results of automated screening
  createdAt: timestamp("created_at").defaultNow(),
});

// Prohibited keywords/phrases for content filtering
export const prohibitedContent = pgTable("prohibited_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: varchar("keyword").notNull().unique(),
  category: varchar("category").notNull(), // 'childcare', 'medical', 'legal', 'financial', 'dangerous'
  severity: integer("severity").default(5), // 1-10 severity score
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type TaskParticipant = typeof taskParticipants.$inferSelect;
export type TaskApprovalLog = typeof taskApprovalLogs.$inferSelect;
export type ProhibitedContent = typeof prohibitedContent.$inferSelect;
export type TaskVerificationRequirement = typeof taskVerificationRequirements.$inferSelect;
export type TaskCompletionSubmission = typeof taskCompletionSubmissions.$inferSelect;
export type UserVerificationHistory = typeof userVerificationHistory.$inferSelect;
export type CorporateVerificationSettings = typeof corporateVerificationSettings.$inferSelect;
export type TaskVerification = typeof taskVerifications.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentParticipants: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTaskCompletionSubmissionSchema = createInsertSchema(taskCompletionSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskVerificationSchema = createInsertSchema(taskVerifications).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertTaskVerificationRequirementSchema = createInsertSchema(taskVerificationRequirements).omit({
  id: true,
  createdAt: true,
});

// Form schemas with additional validation
export const communityTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be under 500 characters"),
  earningPotential: z.number().min(5, "Minimum earning is $5").max(500, "Maximum earning is $500"),
  maxParticipants: z.number().min(1, "At least 1 participant required").max(20, "Maximum 20 participants"),
  location: z.string().min(1, "Location is required").max(200, "Location must be under 200 characters"),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  requirements: z.string().optional(),
  categoryId: z.string().optional(),
});

export const barterTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be under 500 characters"),
  offering: z.string().min(1, "What you're offering is required").max(200, "Offering must be under 200 characters"),
  seeking: z.string().min(1, "What you're seeking is required").max(200, "Seeking must be under 200 characters"),
  location: z.string().min(1, "Location is required").max(200, "Location must be under 200 characters"),
  duration: z.string().min(1, "Time estimate is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tradeType: z.enum(["service_for_service", "item_for_service", "service_for_item", "item_for_item"]),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(10, "Maximum 10 tags"),
  categoryId: z.string().optional(),
});

export const userFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});



// Complete relations for all tables - needed for Drizzle joins to work
export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: "taskCreator" }),
  taskParticipations: many(taskParticipants),
  transactions: many(transactions),
  achievements: many(userAchievements),
  sentMessages: many(messages, { relationName: "messageSender" }),
  receivedMessages: many(messages, { relationName: "messageReceiver" }),
  verificationHistory: many(userVerificationHistory),
  earnings: many(userEarnings),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "taskCreator"
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id]
  }),
  participants: many(taskParticipants),
  verifications: many(taskCompletionSubmissions),
  verificationRequirements: many(taskVerificationRequirements),
  transactions: many(transactions),
  messages: many(messages),
  approvalLogs: many(taskApprovalLogs),
  payments: many(payments),
  aiVerifications: many(taskVerifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const taskParticipantsRelations = relations(taskParticipants, ({ one }) => ({
  task: one(tasks, {
    fields: [taskParticipants.taskId],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [taskParticipants.userId],
    references: [users.id]
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [transactions.taskId],
    references: [tasks.id]
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messageSender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "messageReceiver"
  }),
  task: one(tasks, {
    fields: [messages.taskId],
    references: [tasks.id]
  }),
}));

export const taskCompletionSubmissionsRelations = relations(taskCompletionSubmissions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCompletionSubmissions.taskId],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [taskCompletionSubmissions.userId],
    references: [users.id]
  }),
  participant: one(taskParticipants, {
    fields: [taskCompletionSubmissions.participantId],
    references: [taskParticipants.id]
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  }),
}));

// Type exports for forms
export type CommunityTaskFormData = z.infer<typeof communityTaskFormSchema>;
export type BarterTaskFormData = z.infer<typeof barterTaskFormSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
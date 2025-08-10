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
import { z } from 'zod';

// Enums
export const taskStatusEnum = pgEnum('task_status', ['open', 'active', 'completed', 'cancelled']);
export const taskTypeEnum = pgEnum('task_type', ['shared', 'solo', 'sponsored', 'barter']);
export const transactionTypeEnum = pgEnum('transaction_type', ['task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'processing', 'completed', 'failed']);

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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  verified: boolean("verified").default(false),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default('0.00'),
  tasksCompleted: integer("tasks_completed").default(0),
  activeReferrals: integer("active_referrals").default(0),
  monthlyGoal: decimal("monthly_goal", { precision: 10, scale: 2 }).default('500.00'),
  // Subscription fields
  subscriptionTier: varchar("subscription_tier").default('free'), // free, pro, premium
  subscriptionStatus: varchar("subscription_status").default('active'), // active, cancelled, past_due
  stripeCustomerId: varchar("stripe_customer_id"),
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
  hostId: varchar("host_id").references(() => users.id).notNull(),
  type: taskTypeEnum("type").default('shared'),
  status: taskStatusEnum("status").default('open'),
  earningPotential: decimal("earning_potential", { precision: 8, scale: 2 }).notNull(),
  maxParticipants: integer("max_participants").default(1),
  currentParticipants: integer("current_participants").default(0),
  duration: varchar("duration"),
  location: varchar("location"),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  requirements: text("requirements"),
  sponsorId: varchar("sponsor_id"),
  sponsorBudget: decimal("sponsor_budget", { precision: 10, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task participants
export const taskParticipants = pgTable("task_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: varchar("status").default('joined'), // joined, completed, cancelled
  earnedAmount: decimal("earned_amount", { precision: 8, scale: 2 }),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
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

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type TaskParticipant = typeof taskParticipants.$inferSelect;

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

// Form schemas with additional validation
export const taskFormSchema = insertTaskSchema.extend({
  earningPotential: z.number().min(5).max(500),
  maxParticipants: z.number().min(1).max(20),
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  location: z.string().min(1).max(200),
});

export const userFormSchema = insertUserSchema.extend({
  email: z.string().email(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

// Type exports for forms
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
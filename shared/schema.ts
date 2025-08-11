import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table for authentication and profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, premium
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  emailVerified: boolean("email_verified").default(false),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks - the core of the platform
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  creatorId: varchar("creator_id").references(() => users.id),
  type: varchar("type").notNull(), // solo, community, self-care
  payout: decimal("payout", { precision: 10, scale: 2 }).notNull(),
  isSponsored: boolean("is_sponsored").default(false),
  sponsorName: varchar("sponsor_name"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  location: varchar("location"),
  dateTime: timestamp("date_time"),
  requirements: text("requirements").array(),
  status: varchar("status").default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task applications/completions
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").default("pending"), // pending, approved, rejected, paid
  submissionNotes: text("submission_notes"),
  proofPhotos: text("proof_photos").array(),
  earnings: decimal("earnings", { precision: 10, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages for task coordination
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id),
  senderId: varchar("sender_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof taskCompletions.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertCategorySchema = createInsertSchema(categories);
export const insertTaskCompletionSchema = createInsertSchema(taskCompletions);
export const insertMessageSchema = createInsertSchema(messages);

// Extended schemas for forms
export const createTaskSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  payout: z.string().min(1, "Payout is required"),
  type: z.enum(["solo", "community", "self-care"]),
});

export const userProfileSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
});
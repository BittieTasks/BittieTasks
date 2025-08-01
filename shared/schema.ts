import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  totalEarnings: decimal("total_earnings").default("0.00"),
  rating: decimal("rating").default("0.00"),
  completedTasks: integer("completed_tasks").default(0),
  currentStreak: integer("current_streak").default(0),
  skills: text("skills").array().default([]),
  availability: jsonb("availability"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
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
  sponsorInfo: text("sponsor_info"), // For sponsored tasks
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
  achievementType: text("achievement_type").notNull(),
  achievementData: jsonb("achievement_data"),
  earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`)
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

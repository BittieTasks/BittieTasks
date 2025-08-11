import {
  users,
  tasks,
  categories,
  taskCompletions,
  messages,
  type User,
  type InsertUser,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Category,
  type TaskCompletion,
  type InsertTaskCompletion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByCategory(categoryId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  
  // Task completion operations
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
  getTaskCompletionsByUser(userId: string): Promise<TaskCompletion[]>;
  updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion>;
  
  // Earnings operations
  getUserEarnings(userId: string): Promise<{ total: number; thisMonth: number; }>;
  updateUserEarnings(userId: string, amount: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.status, 'active')).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(and(eq(tasks.categoryId, categoryId), eq(tasks.status, 'active')))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Task completion operations
  async createTaskCompletion(completionData: InsertTaskCompletion): Promise<TaskCompletion> {
    const [completion] = await db.insert(taskCompletions).values(completionData).returning();
    return completion;
  }

  async getTaskCompletionsByUser(userId: string): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions)
      .where(eq(taskCompletions.userId, userId))
      .orderBy(desc(taskCompletions.createdAt));
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion> {
    const [completion] = await db
      .update(taskCompletions)
      .set(updates)
      .where(eq(taskCompletions.id, id))
      .returning();
    return completion;
  }

  // Earnings operations
  async getUserEarnings(userId: string): Promise<{ total: number; thisMonth: number; }> {
    const [totalResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${taskCompletions.earnings}), 0)` })
      .from(taskCompletions)
      .where(and(eq(taskCompletions.userId, userId), eq(taskCompletions.status, 'paid')));

    const [monthResult] = await db
      .select({ thisMonth: sql<number>`COALESCE(SUM(${taskCompletions.earnings}), 0)` })
      .from(taskCompletions)
      .where(and(
        eq(taskCompletions.userId, userId),
        eq(taskCompletions.status, 'paid'),
        sql`${taskCompletions.completedAt} >= date_trunc('month', current_date)`
      ));

    return {
      total: Number(totalResult?.total || 0),
      thisMonth: Number(monthResult?.thisMonth || 0),
    };
  }

  async updateUserEarnings(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        totalEarnings: sql`${users.totalEarnings} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
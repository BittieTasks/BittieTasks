import { 
  users, 
  taskCategories, 
  tasks, 
  taskCompletions, 
  messages, 
  userAchievements, 
  achievementDefinitions, 
  dailyChallenges, 
  userChallenges,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type TaskCategory,
  type InsertTaskCategory,
  type TaskCompletion,
  type InsertTaskCompletion,
  type Message,
  type InsertMessage,
  type UserAchievement,
  type InsertUserAchievement,
  type AchievementDefinition,
  type InsertAchievementDefinition,
  type DailyChallenge,
  type InsertDailyChallenge,
  type UserChallenge,
  type InsertUserChallenge,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import type { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users);
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return user || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Task Category methods
  async getTaskCategories(): Promise<TaskCategory[]> {
    try {
      const result = await db.select().from(taskCategories);
      return result;
    } catch (error) {
      console.error('Error fetching task categories:', error);
      return [];
    }
  }

  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> {
    try {
      const [taskCategory] = await db
        .insert(taskCategories)
        .values(category)
        .returning();
      return taskCategory;
    } catch (error) {
      console.error('Error creating task category:', error);
      throw new Error(`Failed to create task category: ${error.message}`);
    }
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    try {
      const result = await db.select().from(tasks).where(eq(tasks.isActive, true));
      return result;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async getTask(id: string): Promise<Task | undefined> {
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      return task || undefined;
    } catch (error) {
      console.error('Error fetching task:', error);
      return undefined;
    }
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.categoryId, categoryId), eq(tasks.isActive, true)));
      return result;
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      return [];
    }
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    try {
      const [task] = await db
        .insert(tasks)
        .values(taskData)
        .returning();
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Task Completion methods
  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    try {
      const result = await db
        .select()
        .from(taskCompletions)
        .where(eq(taskCompletions.userId, userId))
        .orderBy(desc(taskCompletions.completedAt));
      return result;
    } catch (error) {
      console.error('Error fetching task completions:', error);
      return [];
    }
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    try {
      const [taskCompletion] = await db
        .insert(taskCompletions)
        .values(completion)
        .returning();
      return taskCompletion;
    } catch (error) {
      console.error('Error creating task completion:', error);
      throw new Error(`Failed to create task completion: ${error.message}`);
    }
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    try {
      const [taskCompletion] = await db
        .update(taskCompletions)
        .set(updates)
        .where(eq(taskCompletions.id, id))
        .returning();
      return taskCompletion || undefined;
    } catch (error) {
      console.error('Error updating task completion:', error);
      return undefined;
    }
  }

  async updateTaskCompletionStatus(id: string, status: string): Promise<TaskCompletion | undefined> {
    return this.updateTaskCompletion(id, { status });
  }

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    try {
      const [completion] = await db
        .select()
        .from(taskCompletions)
        .where(eq(taskCompletions.id, id));
      return completion || undefined;
    } catch (error) {
      console.error('Error fetching task completion:', error);
      return undefined;
    }
  }

  // Message methods
  async getMessages(userId: string): Promise<Message[]> {
    try {
      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.toUserId, userId))
        .orderBy(desc(messages.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const [newMessage] = await db
        .insert(messages)
        .values(message)
        .returning();
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  async markMessageAsRead(id: string): Promise<void> {
    try {
      await db
        .update(messages)
        .set({ isRead: true })
        .where(eq(messages.id, id));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // Helper methods for existing functionality
  async updateUserEarnings(userId: string, amount: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentEarnings = parseFloat(user.totalEarnings || "0");
    const newEarnings = currentEarnings + parseFloat(amount);
    
    return this.updateUser(userId, {
      totalEarnings: newEarnings.toFixed(2)
    });
  }

  async updateUserStatus(userId: string, status: any): Promise<User | undefined> {
    return this.updateUser(userId, { ...status });
  }

  async updateUserAdPreferences(userId: string, preferences: any): Promise<User | undefined> {
    return this.updateUser(userId, { ...preferences });
  }

  // Achievement methods (stubs for now)
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return [];
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db
      .insert(userAchievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return [];
  }

  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> {
    const [newDefinition] = await db
      .insert(achievementDefinitions)
      .values(definition)
      .returning();
    return newDefinition;
  }

  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> {
    return undefined;
  }

  // Challenge methods (stubs)
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return [];
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db
      .insert(dailyChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    return [];
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values({ userId, challengeId })
      .returning();
    return newUserChallenge;
  }

  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> {
    return undefined;
  }

  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> {
    return [];
  }

  // Security and verification methods (stubs)
  async getUserActivity(userId: string, hours: number): Promise<any[]> {
    return [];
  }

  async logSuspiciousActivity(userId: string, activity: any): Promise<void> {
    // Stub
  }

  async updateUserVerification(userId: string, verificationData: Partial<User>): Promise<User | undefined> {
    return this.updateUser(userId, verificationData);
  }

  async getUserVerificationStatus(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    return {
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      isBackgroundChecked: user.isBackgroundChecked,
      humanVerificationLevel: user.humanVerificationLevel,
      trustScore: user.trustScore
    };
  }

  async logVerificationActivity(userId: string, activityType: string, metadata?: any): Promise<void> {
    // Stub - would log to verification activity table
  }

  async incrementRiskScore(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(userId, { 
        riskScore: (user.riskScore || 0) + amount 
      });
    }
  }

  async lockUserAccount(userId: string, reason: string): Promise<void> {
    await this.updateUser(userId, { 
      accountLocked: true,
      lockUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const result = await db.select().from(tasks);
      return result;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    try {
      const result = await db.select().from(taskCompletions);
      return result;
    } catch (error) {
      console.error('Error fetching all task completions:', error);
      return [];
    }
  }

  async initializeDailyChallenges(): Promise<void> {
    // Stub
  }

  // Barter methods (stubs)
  async getBarterTasks(): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.paymentType, 'barter'), eq(tasks.isActive, true)));
      return result;
    } catch (error) {
      console.error('Error fetching barter tasks:', error);
      return [];
    }
  }

  async createBarterTask(task: InsertTask): Promise<Task> {
    return this.createTask({ ...task, paymentType: 'barter' });
  }

  async createBarterTransaction(transaction: any): Promise<any> {
    return { id: crypto.randomUUID(), ...transaction };
  }

  async getUserBarterTransactions(userId: string): Promise<any[]> {
    return [];
  }

  async updateBarterTransaction(id: string, updates: any): Promise<any> {
    return undefined;
  }

  async ensureBarterCategory(): Promise<void> {
    // Check if barter category exists, create if not
    const categories = await this.getTaskCategories();
    const barterCategory = categories.find(cat => cat.name === 'Barter');
    
    if (!barterCategory) {
      await this.createTaskCategory({
        name: 'Barter',
        description: 'Trade skills and services without cash',
        icon: 'fa-exchange-alt',
        color: '#8b5cf6'
      });
    }
  }

  // Admin method to clear all user data
  async clearAllUserData(): Promise<{ success: boolean; message: string; deletedCounts: any }> {
    try {
      const deletedCounts = {
        users: 0,
        taskCompletions: 0,
        messages: 0,
        userAchievements: 0,
        userChallenges: 0
      };

      // Clear in order to respect foreign key constraints
      await db.delete(userChallenges);
      await db.delete(userAchievements);
      await db.delete(messages);
      await db.delete(taskCompletions);
      
      const usersResult = await db.delete(users).returning();
      deletedCounts.users = usersResult.length;

      return {
        success: true,
        message: 'All user data cleared successfully',
        deletedCounts
      };

    } catch (error) {
      console.error('Error clearing user data:', error);
      return {
        success: false,
        message: `Failed to clear user data: ${error.message}`,
        deletedCounts: {}
      };
    }
  }
}

export const storage = new DatabaseStorage();
// Storage interface and implementations
import { 
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

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Task Category methods
  getTaskCategories(): Promise<TaskCategory[]>;
  createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByCategory(categoryId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  
  // Task Completion methods
  getTaskCompletions(userId: string): Promise<TaskCompletion[]>;
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
  updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined>;
  
  // Message methods
  getMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;
  
  // Achievement methods
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  getAchievementDefinitions(): Promise<AchievementDefinition[]>;
  createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition>;
  updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined>;

  // Daily Challenges
  getDailyChallenges(): Promise<DailyChallenge[]>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]>;
  
  // Security and verification methods
  getUserActivity(userId: string, hours: number): Promise<any[]>;
  logSuspiciousActivity(userId: string, activity: any): Promise<void>;
  assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined>;
  getTodaysChallenges(userId: string): Promise<UserChallenge[]>;
  
  // Human verification methods
  updateUserVerification(userId: string, verificationData: Partial<User>): Promise<User | undefined>;
  getUserVerificationStatus(userId: string): Promise<any>;
  logVerificationActivity(userId: string, activityType: string, metadata?: any): Promise<void>;
  incrementRiskScore(userId: string, amount: number): Promise<void>;
  lockUserAccount(userId: string, reason: string): Promise<void>;

  // Admin methods for platform management
  getAllUsers(): Promise<User[]>;
  getAllTasks(): Promise<Task[]>;
  getAllTaskCompletions(): Promise<TaskCompletion[]>;
  getTaskCompletion(id: string): Promise<TaskCompletion | undefined>;
  initializeDailyChallenges(): void;

  // Barter methods
  getBarterTasks(): Promise<Task[]>;
  createBarterTask(task: InsertTask): Promise<Task>;
  createBarterTransaction(transaction: any): Promise<any>;
  getUserBarterTransactions(userId: string): Promise<any[]>;
  updateBarterTransaction(id: string, updates: any): Promise<any>;
  ensureBarterCategory(): Promise<void>;

  // Admin methods
  clearAllUserData(): Promise<{ success: boolean; message: string; deletedCounts: any }>;
}

// Simple placeholder storage for compatibility
class MemStorage implements IStorage {
  // Placeholder methods - actual data handled by Supabase
  async getUsers(): Promise<User[]> { return []; }
  async getUser(id: string): Promise<User | undefined> { return undefined; }
  async getUserByEmail(email: string): Promise<User | undefined> { return undefined; }
  async getUserByVerificationToken(token: string): Promise<User | undefined> { return undefined; }
  async createUser(user: InsertUser): Promise<User> { throw new Error('Use Supabase'); }
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> { return undefined; }
  
  async getTaskCategories(): Promise<TaskCategory[]> { return []; }
  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> { throw new Error('Use Supabase'); }
  
  async getTasks(): Promise<Task[]> { return []; }
  async getTask(id: string): Promise<Task | undefined> { return undefined; }
  async getTasksByCategory(categoryId: string): Promise<Task[]> { return []; }
  async createTask(task: InsertTask): Promise<Task> { throw new Error('Use Supabase'); }
  
  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> { return []; }
  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> { throw new Error('Use Supabase'); }
  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> { return undefined; }
  
  async getMessages(userId: string): Promise<Message[]> { return []; }
  async createMessage(message: InsertMessage): Promise<Message> { throw new Error('Use Supabase'); }
  async markMessageAsRead(id: string): Promise<void> {}
  
  async getUserAchievements(userId: string): Promise<UserAchievement[]> { return []; }
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> { throw new Error('Use Supabase'); }
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> { return []; }
  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> { throw new Error('Use Supabase'); }
  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> { return undefined; }

  async getDailyChallenges(): Promise<DailyChallenge[]> { return []; }
  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> { throw new Error('Use Supabase'); }
  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> { return []; }
  
  async getUserActivity(userId: string, hours: number): Promise<any[]> { return []; }
  async logSuspiciousActivity(userId: string, activity: any): Promise<void> {}
  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> { throw new Error('Use Supabase'); }
  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> { return undefined; }
  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> { return []; }
  
  async updateUserVerification(userId: string, verificationData: Partial<User>): Promise<User | undefined> { return undefined; }
  async getUserVerificationStatus(userId: string): Promise<any> { return null; }
  async logVerificationActivity(userId: string, activityType: string, metadata?: any): Promise<void> {}
  async incrementRiskScore(userId: string, amount: number): Promise<void> {}
  async lockUserAccount(userId: string, reason: string): Promise<void> {}

  async getAllUsers(): Promise<User[]> { return []; }
  async getAllTasks(): Promise<Task[]> { return []; }
  async getAllTaskCompletions(): Promise<TaskCompletion[]> { return []; }
  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> { return undefined; }
  initializeDailyChallenges(): void {}

  async getBarterTasks(): Promise<Task[]> { return []; }
  async createBarterTask(task: InsertTask): Promise<Task> { throw new Error('Use Supabase'); }
  async createBarterTransaction(transaction: any): Promise<any> { throw new Error('Use Supabase'); }
  async getUserBarterTransactions(userId: string): Promise<any[]> { return []; }
  async updateBarterTransaction(id: string, updates: any): Promise<any> { return null; }
  async ensureBarterCategory(): Promise<void> {}

  async clearAllUserData(): Promise<{ success: boolean; message: string; deletedCounts: any }> { 
    return { success: false, message: 'Use Supabase', deletedCounts: {} }; 
  }
}

export const storage = new MemStorage();
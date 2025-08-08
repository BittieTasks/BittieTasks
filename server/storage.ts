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

// Export Supabase storage for production
export { storage } from './supabase-storage';
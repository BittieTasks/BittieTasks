import { demoUsers, demoCategories, demoTasks } from './demo-data';
import { 
  type User, 
  type InsertUser,
  type Task,
  type TaskCategory,
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
import { randomUUID } from "crypto";

// Simple in-memory storage with demo data until database connection is fixed
export class SimpleStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return demoUsers;
  }

  async getUser(id: string): Promise<User | undefined> {
    return demoUsers.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return demoUsers.find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: userData.username || `${userData.firstName}_${userData.lastName}`,
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: userData.profilePicture || null,
      totalEarnings: "0.00",
      rating: "5.0",
      completedTasks: 0,
      currentStreak: 0,
      skills: [],
      availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      isEmailVerified: false,
      isPhoneVerified: false,
      isIdentityVerified: false,
      isBackgroundChecked: false,
      phoneNumber: userData.phoneNumber || null,
      phoneVerificationCode: null,
      phoneVerificationExpires: null,
      identityDocuments: [],
      trustScore: 0,
      riskScore: 0,
      identityScore: 0,
      isCaptchaVerified: false,
      captchaScore: "0.0",
      deviceFingerprint: null,
      ipAddress: null,
      userAgent: null,
      signupMethod: "email",
      behaviorScore: 0,
      lastCaptchaVerification: null,
      governmentIdUploaded: false,
      governmentIdVerified: false,
      faceVerificationCompleted: false,
      livelinessCheckPassed: false,
      mouseMovementAnalyzed: false,
      keystrokePatternAnalyzed: false,
      sessionBehaviorScore: 0,
      humanVerificationLevel: "basic",
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
      emailVerificationToken: userData.emailVerificationToken || null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockUntil: null,
      createdAt: new Date(),
      subscriptionTier: "free",
      subscriptionStatus: "active",
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      monthlyTaskLimit: 5,
      monthlyTasksCompleted: 0,
      lastMonthlyReset: new Date(),
      prioritySupport: false,
      adFree: false,
      premiumBadge: false,
      referralCode: null,
      referredBy: null,
      referralCount: 0,
      referralEarnings: "0.00",
      adFrequency: 5,
      adRelevance: 7,
      adTypes: ["native_feed", "sponsored_task"],
      adCategories: ["education", "health-wellness", "retail"],
      maxAdBudget: 100,
      minAdBudget: 10,
      familyFriendlyOnly: true,
      localAdsOnly: false,
      ethicalAdsOnly: true,
      adPersonalization: true
    };
    demoUsers.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = demoUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    demoUsers[userIndex] = { ...demoUsers[userIndex], ...updates };
    return demoUsers[userIndex];
  }

  // Task Category methods
  async getTaskCategories(): Promise<TaskCategory[]> {
    return demoCategories;
  }

  async createTaskCategory(category: any): Promise<TaskCategory> {
    const newCategory: TaskCategory = {
      id: randomUUID(),
      ...category
    };
    demoCategories.push(newCategory);
    return newCategory;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return demoTasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return demoTasks.find(task => task.id === id);
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return demoTasks.filter(task => task.categoryId === categoryId);
  }

  async createTask(taskData: any): Promise<Task> {
    const newTask: Task = {
      id: randomUUID(),
      createdAt: new Date(),
      rating: "0.00",
      completions: 0,
      isActive: true,
      requirements: [],
      imageUrl: null,
      sponsorInfo: null,
      paymentType: "cash",
      barterOffered: null,
      barterWanted: null,
      estimatedValue: null,
      barterCategory: null,
      allowAccountabilityPartners: false,
      maxPartners: 3,
      partnerPayment: "0.00",
      flexibleBarter: false,
      ...taskData
    };
    demoTasks.push(newTask);
    return newTask;
  }

  // Stub methods for other functionality
  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    return [];
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const newCompletion = {
      id: randomUUID(),
      completedAt: new Date(),
      status: "pending",
      earnings: "0.00",
      platformFee: "0.00", 
      netEarnings: "0.00",
      isBarterTransaction: false,
      taxFormRequired: false,
      ...completion
    } as TaskCompletion;
    return newCompletion;
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    return undefined;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return [];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      isRead: false,
      ...message
    } as Message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    // Stub
  }

  // Achievement methods (stubs)
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return [];
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    return {
      id: randomUUID(),
      earnedAt: new Date(),
      isVisible: true,
      progress: 0,
      maxProgress: 1,
      ...achievement
    } as UserAchievement;
  }

  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return [];
  }

  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> {
    return {
      id: randomUUID(),
      rarity: "common",
      rewardPoints: 0,
      isActive: true,
      ...definition
    } as AchievementDefinition;
  }

  // Challenge methods (stubs)
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return [];
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    return {
      id: randomUUID(),
      rewardPoints: 5,
      isActive: true,
      createdAt: new Date(),
      ...challenge
    } as DailyChallenge;
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    return [];
  }

  async createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge> {
    return {
      id: randomUUID(),
      assignedDate: new Date(),
      status: "assigned",
      pointsEarned: 0,
      ...challenge
    } as UserChallenge;
  }

  async updateUserChallenge(id: string, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    return undefined;
  }

  async initializeDailyChallenges(): Promise<void> {
    // Stub
  }

  async ensureBarterCategory(): Promise<void> {
    // Stub - category already exists in demo data
  }
}

export const storage = new SimpleStorage();
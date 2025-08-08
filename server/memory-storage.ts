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
import type { IStorage } from './storage';
import { randomUUID } from "crypto";

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private taskCategories: Map<string, TaskCategory> = new Map();
  private tasks: Map<string, Task> = new Map();
  private taskCompletions: Map<string, TaskCompletion> = new Map();
  private messages: Map<string, Message> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private achievementDefinitions: Map<string, AchievementDefinition> = new Map();
  private dailyChallenges: Map<string, DailyChallenge> = new Map();
  private userChallenges: Map<string, UserChallenge> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default task categories
    const defaultCategories: TaskCategory[] = [
      {
        id: '440740be-526e-4c88-a9e4-d6a4abb94b28',
        name: 'Household',
        icon: 'fa-home',
        color: '#3B82F6',
        description: 'Home and household tasks'
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Childcare',
        icon: 'fa-baby',
        color: '#10B981',
        description: 'Childcare and parenting tasks'
      },
      {
        id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        name: 'Shopping',
        icon: 'fa-shopping-cart',
        color: '#F59E0B',
        description: 'Shopping and errands'
      },
      {
        id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        name: 'Transportation',
        icon: 'fa-car',
        color: '#EF4444',
        description: 'Transportation and delivery'
      },
      {
        id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
        name: 'Self-Care',
        icon: 'fa-heart',
        color: '#EC4899',
        description: 'Personal wellness and self-care'
      },
      {
        id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
        name: 'Barter',
        icon: 'fa-exchange-alt',
        color: '#8B5CF6',
        description: 'Trade skills and services without cash'
      }
    ];

    defaultCategories.forEach(category => {
      this.taskCategories.set(category.id, category);
    });

    // Initialize demo tasks
    const defaultTasks: Task[] = [
      {
        id: '8d75f318-a626-4469-9704-083fcd9cbbb2',
        title: 'Help with grocery shopping',
        description: 'Need someone to help carry groceries from the store to my apartment',
        categoryId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        payment: '25.00',
        duration: 60,
        difficulty: 'Easy',
        requirements: [],
        imageUrl: null,
        rating: '4.5',
        completions: 2,
        isActive: true,
        taskType: 'shared',
        sponsorInfo: null,
        paymentType: 'cash',
        barterOffered: null,
        barterWanted: null,
        estimatedValue: null,
        barterCategory: null,
        allowAccountabilityPartners: false,
        maxPartners: 3,
        partnerPayment: '0.00',
        flexibleBarter: false,
        createdAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: 'f1e2d3c4-b5a6-9788-0def-123456789abc',
        title: 'Babysitting for date night',
        description: 'Looking for a trusted babysitter for our 2 kids (ages 4 and 7) for a 3-hour evening',
        categoryId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        payment: '45.00',
        duration: 180,
        difficulty: 'Medium',
        requirements: ['background check', 'experience with children'],
        imageUrl: null,
        rating: '4.8',
        completions: 5,
        isActive: true,
        taskType: 'shared',
        sponsorInfo: null,
        paymentType: 'cash',
        barterOffered: null,
        barterWanted: null,
        estimatedValue: null,
        barterCategory: null,
        allowAccountabilityPartners: false,
        maxPartners: 3,
        partnerPayment: '0.00',
        flexibleBarter: false,
        createdAt: new Date('2024-01-16T14:30:00Z')
      },
      {
        id: 'a9b8c7d6-e5f4-3210-ghij-klmnopqrstuv',
        title: 'House cleaning help',
        description: 'Need help with deep cleaning the house, especially kitchen and bathrooms',
        categoryId: '440740be-526e-4c88-a9e4-d6a4abb94b28',
        payment: '60.00',
        duration: 240,
        difficulty: 'Medium',
        requirements: ['bring own supplies'],
        imageUrl: null,
        rating: '4.7',
        completions: 3,
        isActive: true,
        taskType: 'shared',
        sponsorInfo: null,
        paymentType: 'cash',
        barterOffered: null,
        barterWanted: null,
        estimatedValue: null,
        barterCategory: null,
        allowAccountabilityPartners: false,
        maxPartners: 3,
        partnerPayment: '0.00',
        flexibleBarter: false,
        createdAt: new Date('2024-01-17T09:15:00Z')
      }
    ];

    defaultTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: userData.username || `${userData.firstName?.toLowerCase()}_${userData.lastName?.toLowerCase()}`,
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: null,
      totalEarnings: "0.00",
      rating: "5.0",
      completedTasks: 0,
      currentStreak: 0,
      skills: [],
      availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      isEmailVerified: userData.isEmailVerified || false,
      emailVerificationToken: userData.emailVerificationToken || null,
      phoneNumber: null,
      isPhoneVerified: false,
      isIdentityVerified: false,
      isBackgroundChecked: false,
      createdAt: new Date(),
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
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockUntil: null,
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

    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Task Category methods
  async getTaskCategories(): Promise<TaskCategory[]> {
    return Array.from(this.taskCategories.values());
  }

  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> {
    const id = randomUUID();
    const newCategory: TaskCategory = { id, ...category };
    this.taskCategories.set(id, newCategory);
    return newCategory;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.isActive);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.categoryId === categoryId && task.isActive
    );
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
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

    this.tasks.set(id, task);
    return task;
  }

  // Stub methods for other functionality
  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values()).filter(
      completion => completion.userId === userId
    );
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const id = randomUUID();
    const newCompletion: TaskCompletion = {
      id,
      completedAt: new Date(),
      earnings: "0.00",
      platformFee: "0.00", 
      netEarnings: "0.00",
      isBarterTransaction: false,
      taxFormRequired: false,
      status: "pending",
      rating: null,
      paymentIntentId: null,
      paymentStatus: "pending",
      barterValue: null,
      barterDescription: null,
      barterAgreement: null,
      ...completion
    };
    this.taskCompletions.set(id, newCompletion);
    return newCompletion;
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    const completion = this.taskCompletions.get(id);
    if (!completion) return undefined;
    
    const updatedCompletion = { ...completion, ...updates };
    this.taskCompletions.set(id, updatedCompletion);
    return updatedCompletion;
  }

  async updateTaskCompletionStatus(id: string, status: string): Promise<TaskCompletion | undefined> {
    return this.updateTaskCompletion(id, { status });
  }

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

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    return this.taskCompletions.get(id);
  }

  async getMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.toUserId === userId
    );
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      createdAt: new Date(),
      isRead: false,
      ...message
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
    }
  }

  // Achievement methods (stubs)
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      achievement => achievement.userId === userId
    );
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = randomUUID();
    const newAchievement: UserAchievement = {
      id,
      earnedAt: new Date(),
      isVisible: true,
      progress: 0,
      maxProgress: 1,
      ...achievement
    };
    this.userAchievements.set(id, newAchievement);
    return newAchievement;
  }

  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return Array.from(this.achievementDefinitions.values());
  }

  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> {
    const id = randomUUID();
    const newDefinition: AchievementDefinition = {
      id,
      rarity: "common",
      rewardPoints: 0,
      isActive: true,
      ...definition
    };
    this.achievementDefinitions.set(id, newDefinition);
    return newDefinition;
  }

  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> {
    return undefined;
  }

  // Challenge methods (stubs)
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return Array.from(this.dailyChallenges.values());
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const id = randomUUID();
    const newChallenge: DailyChallenge = {
      id,
      rewardPoints: 5,
      isActive: true,
      createdAt: new Date(),
      ...challenge
    };
    this.dailyChallenges.set(id, newChallenge);
    return newChallenge;
  }

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values()).filter(
      challenge => challenge.userId === userId
    );
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const id = randomUUID();
    const newUserChallenge: UserChallenge = {
      id,
      userId,
      challengeId,
      assignedDate: new Date(),
      status: "assigned",
      pointsEarned: 0,
      completedAt: null,
      reflection: null
    };
    this.userChallenges.set(id, newUserChallenge);
    return newUserChallenge;
  }

  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> {
    return this.userChallenges.get(userChallengeId);
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
    return Array.from(this.tasks.values());
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values());
  }

  async initializeDailyChallenges(): Promise<void> {
    // Stub
  }

  // Barter methods (stubs)
  async getBarterTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.paymentType === 'barter' && task.isActive
    );
  }

  async createBarterTask(task: InsertTask): Promise<Task> {
    return this.createTask({ ...task, paymentType: 'barter' });
  }

  async createBarterTransaction(transaction: any): Promise<any> {
    return { id: randomUUID(), ...transaction };
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
        users: this.users.size,
        taskCompletions: this.taskCompletions.size,
        messages: this.messages.size,
        userAchievements: this.userAchievements.size,
        userChallenges: this.userChallenges.size
      };

      this.users.clear();
      this.taskCompletions.clear();
      this.messages.clear();
      this.userAchievements.clear();
      this.userChallenges.clear();

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

export const storage = new MemoryStorage();
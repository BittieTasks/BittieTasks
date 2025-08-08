import { supabase } from './db';
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
import bcrypt from "bcryptjs";

export class SupabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
    
    return data || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Simplified user creation for Supabase compatibility
    const userWithId = {
      id: randomUUID(),
      email: userData.email,
      password_hash: userData.passwordHash,
      first_name: userData.firstName,
      last_name: userData.lastName,
      created_at: new Date(),
      is_email_verified: userData.isEmailVerified || false,
      email_verification_token: userData.emailVerificationToken || null
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userWithId])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    // Convert Supabase format back to our app format
    const user = {
      id: data.id,
      username: `${data.first_name}_${data.last_name}`,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      profilePicture: null,
      totalEarnings: "0.00",
      rating: "5.0",
      completedTasks: 0,
      currentStreak: 0,
      skills: [],
      availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      isEmailVerified: data.is_email_verified,
      emailVerificationToken: data.email_verification_token,
      phoneNumber: null,
      isPhoneVerified: false,
      isIdentityVerified: false,
      isBackgroundChecked: false,
      createdAt: data.created_at,
      // Default values for remaining fields
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
    } as User;
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    
    return data || undefined;
  }

  // Task Category methods
  async getTaskCategories(): Promise<TaskCategory[]> {
    const { data, error } = await supabase
      .from('task_categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching task categories:', error);
      return [];
    }
    
    return data || [];
  }

  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> {
    const categoryWithId = {
      id: randomUUID(),
      ...category
    };

    const { data, error } = await supabase
      .from('task_categories')
      .insert([categoryWithId])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task category:', error);
      throw new Error(`Failed to create task category: ${error.message}`);
    }
    
    return data;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    
    return data || [];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching task:', error);
      return undefined;
    }
    
    return data || undefined;
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      console.error('Error fetching tasks by category:', error);
      return [];
    }
    
    return data || [];
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const taskWithDefaults = {
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

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskWithDefaults])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
    
    return data;
  }

  // Stub methods for other functionality (to be implemented as needed)
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

  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> {
    return undefined;
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

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    return [];
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    return {
      id: randomUUID(),
      userId,
      challengeId,
      assignedDate: new Date(),
      status: "assigned",
      pointsEarned: 0
    } as UserChallenge;
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
    return this.getTasks();
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    return [];
  }

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    return undefined;
  }

  async initializeDailyChallenges(): Promise<void> {
    // Stub
  }

  // Barter methods (stubs)
  async getBarterTasks(): Promise<Task[]> {
    return this.getTasks().then(tasks => 
      tasks.filter(task => task.paymentType === 'barter')
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
}

export const storage = new SupabaseStorage();
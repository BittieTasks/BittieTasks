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
  type UserActivity
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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

  // Admin methods for platform management
  getTaskCompletion(id: string): Promise<TaskCompletion | undefined>;
  initializeDailyChallenges(): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private taskCategories: Map<string, TaskCategory>;
  private tasks: Map<string, Task>;
  private taskCompletions: Map<string, TaskCompletion>;
  private messages: Map<string, Message>;
  private userAchievements: Map<string, UserAchievement>;
  private achievementDefinitions: Map<string, AchievementDefinition>;
  private dailyChallenges: Map<string, DailyChallenge>;
  private userChallenges: Map<string, UserChallenge>;

  constructor() {
    this.users = new Map();
    this.taskCategories = new Map();
    this.tasks = new Map();
    this.taskCompletions = new Map();
    this.messages = new Map();
    this.userAchievements = new Map();
    this.achievementDefinitions = new Map();
    this.dailyChallenges = new Map();
    this.userChallenges = new Map();
    
    this.initializeDefaultData();
    // Initialize async methods after construction
    setTimeout(() => {
      this.initializeAchievementDefinitions();
      this.initializeDailyChallenges();
    }, 10);
  }

  private initializeDefaultData() {
    // Create default user
    const userId = randomUUID();
    const defaultUser: User = {
      id: userId,
      username: "sarah_parent",
      email: "sarah@example.com",
      passwordHash: "demo_hash",
      firstName: "Sarah",
      lastName: "Miller",
      profilePicture: null,
      totalEarnings: "347.50",
      rating: "4.8",
      completedTasks: 28,
      currentStreak: 5,
      skills: ["cooking", "organizing", "cleaning", "meal-prep"],
      availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      isEmailVerified: true,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      accountLocked: false,
      lockUntil: null,
      createdAt: new Date(),
      isPhoneVerified: true,
      isIdentityVerified: true,
      isBackgroundChecked: true,
      phoneNumber: "+1234567890",
      identityScore: 95
    };
    this.users.set(userId, defaultUser);

    // Create task categories
    const categories = [
      { name: "Cooking", icon: "fa-utensils", color: "primary" },
      { name: "Cleaning", icon: "fa-broom", color: "secondary" },
      { name: "Organizing", icon: "fa-boxes", color: "purple" },
      { name: "Self-Care", icon: "fa-heart", color: "green" },
      { name: "Errands", icon: "fa-shopping-cart", color: "blue" },
      { name: "Outdoor Tasks", icon: "fa-leaf", color: "emerald" }
    ];

    categories.forEach(cat => {
      const id = randomUUID();
      const category: TaskCategory = {
        id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: `Tasks related to ${cat.name.toLowerCase()}`
      };
      this.taskCategories.set(id, category);
    });

    // Create sample tasks
    const sampleTasks = [
      // Personal tasks - paid directly by app
      {
        title: "Do My Family's Laundry",
        description: "I'm doing 3 loads of laundry for my family today. TaskParent pays me $15 to document my process and share laundry tips!",
        payment: "15.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Document sorting process", "Show stain removal techniques", "Share folding tips", "Include before/after photos"],
        imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cleaning",
        taskType: "personal"
      },
      {
        title: "Cook Dinner for My Family",
        description: "Making tonight's family dinner - pasta with homemade sauce! TaskParent pays me $25 to share the recipe and cooking process.",
        payment: "25.00",
        duration: 90,
        difficulty: "Easy",
        requirements: ["Share complete recipe", "Document cooking steps", "Include ingredient costs", "Show plating techniques"],
        imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "personal"
      },
      {
        title: "Clean My Living Room",
        description: "Deep cleaning my living room today! TaskParent pays me $20 to document my cleaning routine and share organization tips.",
        payment: "20.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Show before/after photos", "Document cleaning products used", "Share time-saving tips", "Include organization hacks"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cleaning",
        taskType: "personal"
      },
      {
        title: "My Weekly Meal Prep",
        description: "Prepping meals for my family's week ahead. TaskParent pays me $35 to document my meal prep system and share planning tips!",
        payment: "35.00",
        duration: 180,
        difficulty: "Medium",
        requirements: ["Show meal planning process", "Document prep techniques", "Share storage solutions", "Include budget breakdown"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "personal"
      },
      // Shared tasks - neighbors pay to join
      {
        title: "Weekly Meal Prep - Join Me!",
        description: "I'm meal prepping 6 family dinners this Sunday. Join for $35 and get 3 ready-to-heat meals for your family!",
        payment: "35.00",
        duration: 180,
        difficulty: "Easy",
        requirements: ["Bring your own containers", "Pick up between 2-4pm Sunday", "Dietary restrictions noted in advance", "Payment due at pickup"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "shared"
      },
      {
        title: "Costco Run - Add Your List",
        description: "Making my monthly Costco trip Saturday morning. Add your items to my list for $25 + cost of your items.",
        payment: "25.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Venmo/cash for your items", "Text your list by Friday 8pm", "Pickup Saturday 2-5pm", "Frozen/refrigerated items ready immediately"],
        imageUrl: "https://images.unsplash.com/photo-1543083115-a1d7e38e97a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "shared"
      },
      {
        title: "Playdate & Childcare Swap",
        description: "Watching 4 kids today anyway - can take 2 more for 3 hours while you run errands. $35/child.",
        payment: "35.00",
        duration: 180,
        difficulty: "Medium",
        requirements: ["Ages 3-8 only", "Bring snacks and activities", "Emergency contact required", "Pick up by 5pm sharp"],
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "shared"
      },
      {
        title: "Garage Sale Prep Together",
        description: "Organizing my garage sale this weekend - help me sort and price, then sell your stuff too! $45 space rental.",
        payment: "45.00",
        duration: 480,
        difficulty: "Medium",
        requirements: ["Bring your own items to sell", "Help with setup Friday evening", "Work Saturday morning shift", "Split any shared item sales 50/50"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "shared"
      },
      {
        title: "Morning School Drop-off Route",
        description: "I drive to Lincoln Elementary daily - can take 2 more kids for $25/week per child. Regular carpool commitment.",
        payment: "25.00",
        duration: 30,
        difficulty: "Easy",
        requirements: ["Car seats/boosters if needed", "Kids ready by 7:45am", "Weekly payment in advance", "Backup plan for sick days"],
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "shared"
      },
      // Self-Care Tasks - parents get paid for taking care of themselves!
      {
        title: "My Morning Workout Routine",
        description: "Doing my 45-minute morning workout today! TaskParent pays me $20 to document my routine and share fitness tips for busy parents.",
        payment: "20.00",
        duration: 45,
        difficulty: "Easy",
        requirements: ["Document workout routine", "Share time-saving fitness tips", "Include modifications for home workouts", "Show energy boost results"],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "personal"
      },
      {
        title: "Coffee Date with My Best Friend",
        description: "Taking 2 hours for coffee with my friend today - self-care is essential! TaskParent pays me $15 to share tips on maintaining friendships as a busy parent.",
        payment: "15.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Share conversation topics for parent friends", "Document the mental health benefits", "Include tips for scheduling friend time", "Show how friendships energize you"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "personal"
      },
      {
        title: "My Weekly Solo Target Run",
        description: "Taking 90 minutes to shop alone at Target - essential parent self-care! TaskParent pays me $18 to share tips for efficient solo shopping.",
        payment: "18.00",
        duration: 90,
        difficulty: "Easy",
        requirements: ["Document efficient shopping strategies", "Share how solo time reduces stress", "Include budget-friendly self-care finds", "Show the mental health benefits"],
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64400acb8c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "personal"
      },
      {
        title: "Evening Bath & Skincare Routine",
        description: "My 60-minute evening wind-down routine with bath and skincare. TaskParent pays me $25 to share affordable self-care routines for parents!",
        payment: "25.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Document affordable skincare routine", "Share relaxation techniques", "Include budget-friendly bath products", "Show the importance of evening self-care"],
        imageUrl: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "personal"
      },
      // Shared Self-Care - parents supporting each other!
      {
        title: "Morning Walk Group - Join Me!",
        description: "I walk for 45 minutes every morning - join me! $12 per person for accountability and motivation. Let's prioritize our health together!",
        payment: "12.00",
        duration: 45,
        difficulty: "Easy",
        requirements: ["Meet at park entrance 7am", "Comfortable walking shoes", "Water bottle", "Positive attitude and parent support"],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "shared"
      },
      {
        title: "Parent Coffee & Chat Session",
        description: "Monthly parent support coffee meetup! Join me for 2 hours of adult conversation and mutual support. $20 per person includes coffee and snacks.",
        payment: "20.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["No kids - this is parent time", "Open to sharing and listening", "Venmo for coffee/snacks", "Commitment to monthly meetups"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "shared"
      },
      // Premium shared tasks - higher payments for experienced parents
      {
        title: "Premium Meal Prep Service - 5 Families",
        description: "I'm scaling up my meal prep! Join 4 other families for premium meal prep service. $75 per family for 6 complete meals.",
        payment: "75.00",
        duration: 300,
        difficulty: "Medium",
        requirements: ["Minimum 4 families to proceed", "Premium organic ingredients", "Custom dietary accommodations", "Professional meal containers included"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "shared"
      },
      {
        title: "Professional After School Care Hub",
        description: "Professional after-school care for 6 kids ages 5-12. Homework help, snacks, activities. $50/child for 3-hour daily care.",
        payment: "50.00",
        duration: 180,
        difficulty: "Hard",
        requirements: ["Background check verified", "Educational activities provided", "Homework supervision", "Healthy snacks included", "Weekly progress reports"],
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "shared"
      },
      {
        title: "Complete Home Organization Service",
        description: "Transform your entire home organization system! I'll help organize multiple rooms in your house using proven systems and premium products.",
        payment: "120.00",
        duration: 480,
        difficulty: "Hard",
        requirements: ["Multiple rooms included", "Professional organization products", "Before/after documentation", "Maintenance system setup", "30-day follow-up included"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "shared"
      },
      {
        title: "Family Budget & Meal Planning Consultation",
        description: "I'll help you plan meals and budget for your family of 4. Get my complete system and money-saving strategies that save $200+ monthly.",
        payment: "85.00",
        duration: 120,
        difficulty: "Medium",
        requirements: ["Custom budget spreadsheet", "4-week meal plan examples", "Grocery shopping strategy", "Cost-saving techniques", "Family-friendly recipe collection"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "shared"
      },
      {
        title: "Premium Kids' Learning Activities Package",
        description: "Join my weekly educational activities for kids 2-6 years old. Includes materials, activities, and learning objectives. $45 per child per session.",
        payment: "45.00",
        duration: 120,
        difficulty: "Medium",
        requirements: ["Age-appropriate activities (2-6 years)", "All materials provided", "Learning objectives explained", "Safety protocols followed", "Progress tracking included"],
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "shared"
      },
      // Sponsored tasks - brands pay extra for community engagement
      {
        title: "Try New Starbucks Holiday Drinks",
        description: "Starbucks is sponsoring a community coffee tasting! Join me to try their new holiday menu items and rate them. Each participant gets a free drink voucher and 20% off coupon.",
        payment: "25.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Must be 16+ years old", "Bring your phone to rate drinks", "Stay for full tasting session", "Complete feedback survey"],
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Starbucks",
          brandDescription: "Community taste testing event sponsored by Starbucks to gather feedback on new holiday menu items",
          specialReward: "Free drink voucher + 20% off coupon for future visits",
          brandColor: "#00704A"
        }
      },
      {
        title: "Target Neighborhood Shopping Group",
        description: "Target is sponsoring community shopping groups! Join our weekly Target run and get exclusive coupons. Perfect for household essentials, groceries, and seasonal items.",
        payment: "20.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Bring reusable bags", "RedCard members get extra discount", "Minimum $50 purchase to qualify", "Share shopping tips with group"],
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Target",
          brandDescription: "Official Target Community Shopping Program - earn cashback and get exclusive member deals",
          specialReward: "$5 Target gift card + exclusive weekly coupons",
          brandColor: "#CC0000"
        }
      },
      {
        title: "Whole Foods Family Cooking Class",
        description: "Whole Foods is hosting a family-friendly cooking demonstration! Learn to make healthy meals together while kids get hands-on cooking experience. Includes take-home recipe cards and samples.",
        payment: "40.00",
        duration: 90,
        difficulty: "Easy",
        requirements: ["Families with kids 5-12 welcome", "Bring aprons", "Stay for full class", "Share photos on social media"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Whole Foods Market",
          brandDescription: "Interactive family cooking class sponsored by Whole Foods to promote healthy family cooking",
          specialReward: "Free ingredient starter kit + 15% off next grocery order",
          brandColor: "#00A04E"
        }
      }
    ];

    sampleTasks.forEach(taskData => {
      const categoryId = Array.from(this.taskCategories.values()).find(cat => cat.name === taskData.categoryName)?.id;
      if (categoryId) {
        const id = randomUUID();
        const task: Task = {
          id,
          title: taskData.title,
          description: taskData.description,
          categoryId,
          payment: taskData.payment,
          duration: taskData.duration,
          difficulty: taskData.difficulty,
          requirements: taskData.requirements,
          imageUrl: taskData.imageUrl,
          rating: "4.8",
          completions: Math.floor(Math.random() * 50) + 10,
          isActive: true,
          taskType: (taskData as any).taskType || "shared",
          sponsorInfo: (taskData as any).sponsorInfo || null,
          createdAt: new Date()
        };
        this.tasks.set(id, task);
      }
    });
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      profilePicture: insertUser.profilePicture || null,
      totalEarnings: insertUser.totalEarnings || "0.00",
      rating: insertUser.rating || "5.0",
      completedTasks: insertUser.completedTasks || 0,
      currentStreak: insertUser.currentStreak || 0,
      skills: insertUser.skills || [],
      availability: insertUser.availability || { weekdays: true, weekends: true, mornings: true, afternoons: true },
      isEmailVerified: insertUser.isEmailVerified || false,
      emailVerificationToken: insertUser.emailVerificationToken || null,
      passwordResetToken: insertUser.passwordResetToken || null,
      passwordResetExpires: insertUser.passwordResetExpires || null,
      lastLogin: insertUser.lastLogin || null,
      failedLoginAttempts: insertUser.failedLoginAttempts || 0,
      accountLocked: insertUser.accountLocked || false,
      lockUntil: insertUser.lockUntil || null,
      createdAt: new Date()
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

  async getTaskCategories(): Promise<TaskCategory[]> {
    return Array.from(this.taskCategories.values());
  }

  async createTaskCategory(insertCategory: InsertTaskCategory): Promise<TaskCategory> {
    const id = randomUUID();
    const category: TaskCategory = { 
      id,
      name: insertCategory.name,
      icon: insertCategory.icon,
      color: insertCategory.color,
      description: insertCategory.description || null
    };
    this.taskCategories.set(id, category);
    return category;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.isActive);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.categoryId === categoryId && task.isActive);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      id,
      title: insertTask.title,
      description: insertTask.description,
      categoryId: insertTask.categoryId || null,
      payment: insertTask.payment,
      duration: insertTask.duration || null,
      difficulty: insertTask.difficulty,
      requirements: insertTask.requirements || null,
      imageUrl: insertTask.imageUrl || null,
      rating: "0.00",
      completions: 0,
      isActive: true,
      taskType: insertTask.taskType || "shared",
      sponsorInfo: insertTask.sponsorInfo || null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values()).filter(completion => completion.userId === userId);
  }

  async createTaskCompletion(insertCompletion: InsertTaskCompletion): Promise<TaskCompletion> {
    const id = randomUUID();
    const completion: TaskCompletion = { 
      id,
      userId: insertCompletion.userId || null,
      taskId: insertCompletion.taskId || null,
      status: insertCompletion.status,
      submissionNotes: insertCompletion.submissionNotes || null,
      reviewNotes: insertCompletion.reviewNotes || null,
      rating: insertCompletion.rating || null,
      earnings: insertCompletion.earnings || null,
      proofFiles: insertCompletion.proofFiles || null,
      completedAt: new Date()
    };
    this.taskCompletions.set(id, completion);
    return completion;
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    const completion = this.taskCompletions.get(id);
    if (!completion) return undefined;
    
    const updatedCompletion = { ...completion, ...updates };
    this.taskCompletions.set(id, updatedCompletion);
    return updatedCompletion;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => 
      message.fromUserId === userId || message.toUserId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      id,
      fromUserId: insertMessage.fromUserId || null,
      toUserId: insertMessage.toUserId || null,
      content: insertMessage.content,
      isRead: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(achievement => achievement.userId === userId);
  }

  async createUserAchievement(insertAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = randomUUID();
    const achievement: UserAchievement = { 
      id,
      userId: insertAchievement.userId || null,
      achievementType: insertAchievement.achievementType,
      achievementData: insertAchievement.achievementData || null,
      earnedAt: new Date(),
      isVisible: insertAchievement.isVisible ?? true,
      progress: insertAchievement.progress || 0,
      maxProgress: insertAchievement.maxProgress || 1
    };
    this.userAchievements.set(id, achievement);
    return achievement;
  }

  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return Array.from(this.achievementDefinitions.values()).filter(def => def.isActive);
  }

  async createAchievementDefinition(insertDefinition: InsertAchievementDefinition): Promise<AchievementDefinition> {
    const id = randomUUID();
    const definition: AchievementDefinition = {
      id,
      type: insertDefinition.type,
      name: insertDefinition.name,
      description: insertDefinition.description,
      icon: insertDefinition.icon,
      color: insertDefinition.color,
      category: insertDefinition.category,
      criteria: insertDefinition.criteria,
      rarity: insertDefinition.rarity || "common",
      rewardPoints: insertDefinition.rewardPoints || 0,
      isActive: insertDefinition.isActive ?? true
    };
    this.achievementDefinitions.set(id, definition);
    return definition;
  }

  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> {
    const achievement = Array.from(this.userAchievements.values()).find(
      a => a.userId === userId && a.achievementType === achievementType
    );
    
    if (achievement) {
      achievement.progress = progress;
      this.userAchievements.set(achievement.id, achievement);
      return achievement;
    }
    return undefined;
  }

  private async initializeAchievementDefinitions() {
    const achievementDefinitions = [
      // Wellness Achievements
      {
        type: "wellness_streak_3",
        name: "Wellness Warrior",
        description: "Complete 3 self-care tasks in a row",
        icon: "💪",
        color: "#10b981",
        category: "wellness",
        criteria: { requiredCount: 3, taskCategory: "Self-Care" },
        rarity: "common",
        rewardPoints: 50
      },
      {
        type: "wellness_streak_7",
        name: "Self-Care Champion",
        description: "Complete self-care tasks for 7 days straight",
        icon: "🏆",
        color: "#f59e0b",
        category: "wellness",
        criteria: { requiredCount: 7, taskCategory: "Self-Care", consecutive: true },
        rarity: "rare",
        rewardPoints: 150
      },
      {
        type: "morning_routine_master",
        name: "Morning Routine Master",
        description: "Complete 5 morning self-care activities",
        icon: "🌅",
        color: "#06b6d4",
        category: "wellness",
        criteria: { requiredCount: 5, timeOfDay: "morning" },
        rarity: "common",
        rewardPoints: 75
      },
      {
        type: "wellness_perfectionist",
        name: "Wellness Perfectionist",
        description: "Complete 30 self-care tasks without missing a day",
        icon: "✨",
        color: "#8b5cf6",
        category: "wellness",
        criteria: { requiredCount: 30, taskCategory: "Self-Care", consecutive: true },
        rarity: "legendary",
        rewardPoints: 500
      },
      
      // Community Achievements
      {
        type: "community_helper",
        name: "Community Helper",
        description: "Share 5 tasks with neighbors",
        icon: "🤝",
        color: "#3b82f6",
        category: "community",
        criteria: { requiredCount: 5, taskType: "shared" },
        rarity: "common",
        rewardPoints: 100
      },
      {
        type: "neighbor_favorite",
        name: "Neighbor's Favorite",
        description: "Receive 10 five-star ratings from neighbors",
        icon: "⭐",
        color: "#f59e0b",
        category: "community",
        criteria: { requiredCount: 10, minRating: 5 },
        rarity: "rare",
        rewardPoints: 200
      },
      {
        type: "community_leader",
        name: "Community Leader",
        description: "Help 50 neighbors with shared tasks",
        icon: "👑",
        color: "#8b5cf6",
        category: "community",
        criteria: { requiredCount: 50, taskType: "shared" },
        rarity: "epic",
        rewardPoints: 300
      },
      
      // Earnings Achievements  
      {
        type: "first_dollar",
        name: "First Dollar Earned",
        description: "Complete your first paid task",
        icon: "💰",
        color: "#10b981",
        category: "earnings",
        criteria: { requiredCount: 1, minEarnings: 1 },
        rarity: "common",
        rewardPoints: 25
      },
      {
        type: "hundred_club",
        name: "Hundred Club",
        description: "Earn $100 through TaskParent",
        icon: "💵",
        color: "#059669",
        category: "earnings",
        criteria: { totalEarnings: 100 },
        rarity: "rare",
        rewardPoints: 150
      },
      {
        type: "thousand_achiever",
        name: "Thousand Achiever",
        description: "Earn $1,000 through TaskParent",
        icon: "🎯",
        color: "#dc2626",
        category: "earnings",
        criteria: { totalEarnings: 1000 },
        rarity: "legendary",
        rewardPoints: 1000
      },
      
      // Engagement Achievements
      {
        type: "brand_partner",
        name: "Brand Partner",
        description: "Complete 3 sponsored brand tasks",
        icon: "🏢",
        color: "#7c3aed",
        category: "engagement",
        criteria: { requiredCount: 3, taskType: "sponsored" },
        rarity: "rare",
        rewardPoints: 125
      },
      {
        type: "social_butterfly",
        name: "Social Butterfly",
        description: "Send 20 messages to other parents",
        icon: "🦋",
        color: "#ec4899",
        category: "engagement",
        criteria: { requiredCount: 20, messagesSent: true },
        rarity: "common",
        rewardPoints: 50
      },
      {
        type: "task_creator",
        name: "Task Creator",
        description: "Create 10 tasks for the community",
        icon: "✏️",
        color: "#f97316",
        category: "engagement",
        criteria: { requiredCount: 10, tasksCreated: true },
        rarity: "rare",
        rewardPoints: 175
      }
    ];

    for (const defData of achievementDefinitions) {
      await this.createAchievementDefinition(defData);
    }
  }

  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return Array.from(this.dailyChallenges.values());
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const id = randomUUID();
    const newChallenge: DailyChallenge = {
      id,
      ...challenge,
      createdAt: new Date()
    };
    this.dailyChallenges.set(id, newChallenge);
    return newChallenge;
  }

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    const challenges = Array.from(this.userChallenges.values())
      .filter(challenge => challenge.userId === userId);
    
    if (date) {
      const targetDate = date.toDateString();
      return challenges.filter(challenge => 
        challenge.assignedAt.toDateString() === targetDate
      );
    }
    
    return challenges;
  }

  async getUserActivity(userId: string, hours: number): Promise<any[]> {
    return [];
  }

  async logSuspiciousActivity(userId: string, activity: any): Promise<void> {
    console.warn(`Suspicious activity detected for user ${userId}:`, activity);
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const id = randomUUID();
    const challenge: UserChallenge = {
      id,
      userId,
      challengeId,
      status: 'assigned',
      assignedAt: new Date(),
      completedAt: null,
      reflection: null,
      pointsEarned: 0
    };
    this.userChallenges.set(id, challenge);
    return challenge;
  }

  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> {
    const challenge = this.userChallenges.get(userChallengeId);
    if (challenge) {
      challenge.status = 'completed';
      challenge.completedAt = new Date();
      challenge.reflection = reflection || null;
      challenge.pointsEarned = 25;
      return challenge;
    }
    return undefined;
  }

  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> {
    const today = new Date().toDateString();
    return Array.from(this.userChallenges.values())
      .filter(challenge => 
        challenge.userId === userId && 
        challenge.assignedAt.toDateString() === today
      );
  }

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    return this.taskCompletions.get(id);
  }

  initializeDailyChallenges(): void {
    const challenges = [
      {
        title: "Morning Meditation",
        description: "Start your day with 10 minutes of mindfulness",
        category: "wellness",
        pointsReward: 25,
        difficulty: "easy",
        estimatedMinutes: 10
      },
      {
        title: "Healthy Breakfast", 
        description: "Prepare a nutritious breakfast for your family",
        category: "cooking",
        pointsReward: 30,
        difficulty: "easy",
        estimatedMinutes: 20
      }
    ];

    challenges.forEach(challengeData => {
      const id = randomUUID();
      const challenge: DailyChallenge = {
        id,
        ...challengeData,
        createdAt: new Date()
      };
      this.dailyChallenges.set(id, challenge);
    });
  }
}

// Security enhancement: Using PostgreSQL database for production security
import { db } from "./db";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { users, tasks, taskCategories, taskCompletions, messages, userAchievements, achievementDefinitions, dailyChallenges, userChallenges } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getTaskCategories(): Promise<TaskCategory[]> {
    return await db.select().from(taskCategories);
  }

  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> {
    const [newCategory] = await db
      .insert(taskCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.categoryId, categoryId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId));
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const [newCompletion] = await db
      .insert(taskCompletions)
      .values(completion)
      .returning();
    return newCompletion;
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    const [completion] = await db
      .update(taskCompletions)
      .set(updates)
      .where(eq(taskCompletions.id, id))
      .returning();
    return completion || undefined;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.toUserId, userId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db
      .insert(userAchievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return await db.select().from(achievementDefinitions);
  }

  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> {
    const [newDefinition] = await db
      .insert(achievementDefinitions)
      .values(definition)
      .returning();
    return newDefinition;
  }

  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> {
    const [achievement] = await db
      .update(userAchievements)
      .set({ progress })
      .where(eq(userAchievements.userId, userId))
      .returning();
    return achievement || undefined;
  }

  // Daily Challenge Methods
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return await db.select().from(dailyChallenges).where(eq(dailyChallenges.isActive, true));
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db
      .insert(dailyChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    if (!date) {
      return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
    }
    
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, userId),
          gte(userChallenges.assignedDate, startOfDay),
          lt(userChallenges.assignedDate, endOfDay)
        )
      );
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values({
        userId,
        challengeId,
        status: "assigned"
      })
      .returning();
    return newUserChallenge;
  }

  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> {
    const [updatedChallenge] = await db
      .update(userChallenges)
      .set({
        status: "completed",
        completedAt: sql`CURRENT_TIMESTAMP`,
        reflection: reflection || null
      })
      .where(eq(userChallenges.id, userChallengeId))
      .returning();
    
    if (updatedChallenge) {
      // Get challenge details to award points
      const [challenge] = await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.id, updatedChallenge.challengeId));
      
      if (challenge) {
        // Update points earned in user challenge
        await db
          .update(userChallenges)
          .set({ pointsEarned: challenge.rewardPoints })
          .where(eq(userChallenges.id, userChallengeId));
        
        // Update user's total points
        await db
          .update(users)
          .set({ 
            totalPoints: sql`COALESCE(total_points, 0) + ${challenge.rewardPoints}` 
          })
          .where(eq(users.id, updatedChallenge.userId));
      }
    }
    
    return updatedChallenge || undefined;
  }

  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> {
    const today = new Date();
    let todaysChallenges = await this.getUserChallenges(userId, today);
    
    // If no challenges assigned for today, assign random ones
    if (todaysChallenges.length === 0) {
      const allChallenges = await this.getDailyChallenges();
      const randomChallenges = allChallenges
        .sort(() => Math.random() - 0.5)
        .slice(0, 3); // Assign 3 random challenges

      for (const challenge of randomChallenges) {
        const assigned = await this.assignDailyChallenge(userId, challenge.id);
        todaysChallenges.push(assigned);
      }
    }
    
    return todaysChallenges;
  }

  // Initialize sample daily challenges
  async initializeDailyChallenges(): Promise<void> {
    const existingChallenges = await this.getDailyChallenges();
    if (existingChallenges.length > 0) return; // Already initialized

    const sampleChallenges = [
      {
        title: "Morning Mindfulness",
        description: "Take 5 minutes to practice deep breathing or meditation before starting your day",
        category: "wellness",
        difficulty: "easy",
        rewardPoints: 10,
        icon: "🧘‍♀️",
        color: "#8b5cf6",
        estimatedMinutes: 5,
        isActive: true
      },
      {
        title: "Tidy Up One Room",
        description: "Choose one room in your home and spend 15 minutes organizing or cleaning it",
        category: "productivity",
        difficulty: "easy",
        rewardPoints: 15,
        icon: "🏠",
        color: "#06b6d4",
        estimatedMinutes: 15,
        isActive: true
      },
      {
        title: "Connect with a Friend",
        description: "Send a thoughtful message, make a call, or schedule time with someone you care about",
        category: "social",
        difficulty: "easy",
        rewardPoints: 10,
        icon: "💝",
        color: "#ec4899",
        estimatedMinutes: 10,
        isActive: true
      },
      {
        title: "Hydration Check",
        description: "Drink a full glass of water and track your hydration throughout the day",
        category: "health",
        difficulty: "easy",
        rewardPoints: 5,
        icon: "💧",
        color: "#3b82f6",
        estimatedMinutes: 2,
        isActive: true
      },
      {
        title: "Gratitude Practice",
        description: "Write down three things you're grateful for today",
        category: "wellness",
        difficulty: "easy",
        rewardPoints: 10,
        icon: "🙏",
        color: "#f59e0b",
        estimatedMinutes: 5,
        isActive: true
      },
      {
        title: "Quick Exercise",
        description: "Do 10 jumping jacks, stretch for 5 minutes, or take a short walk",
        category: "health",
        difficulty: "easy",
        rewardPoints: 15,
        icon: "🏃‍♀️",
        color: "#10b981",
        estimatedMinutes: 10,
        isActive: true
      },
      {
        title: "Creative Break",
        description: "Spend 15 minutes on a creative activity: drawing, writing, or crafting",
        category: "creativity",
        difficulty: "medium",
        rewardPoints: 20,
        icon: "🎨",
        color: "#f97316",
        estimatedMinutes: 15,
        isActive: true
      },
      {
        title: "Learn Something New",
        description: "Watch an educational video, read an article, or practice a new skill for 10 minutes",
        category: "growth",
        difficulty: "medium",
        rewardPoints: 20,
        icon: "📚",
        color: "#6366f1",
        estimatedMinutes: 10,
        isActive: true
      },
      {
        title: "Random Act of Kindness",
        description: "Do something kind for someone else, whether big or small",
        category: "social",
        difficulty: "medium",
        rewardPoints: 25,
        icon: "❤️",
        color: "#ef4444",
        estimatedMinutes: 20,
        isActive: true
      },
      {
        title: "Digital Detox",
        description: "Put your phone aside for 30 minutes and focus on being present",
        category: "wellness",
        difficulty: "hard",
        rewardPoints: 30,
        icon: "📱",
        color: "#64748b",
        estimatedMinutes: 30,
        isActive: true
      }
    ];

    for (const challengeData of sampleChallenges) {
      await this.createDailyChallenge(challengeData);
    }
  }

  // Admin methods for platform management
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values());
  }

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    return this.taskCompletions.get(id);
  }

  async updateTaskCompletionStatus(id: string, status: string, notes?: string): Promise<void> {
    const completion = this.taskCompletions.get(id);
    if (completion) {
      completion.status = status as any;
      if (notes) {
        completion.submissionNotes = notes;
      }
      this.taskCompletions.set(id, completion);
    }
  }

  async updateUserEarnings(userId: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.earnings = (user.earnings || 0) + amount;
      this.users.set(userId, user);
    }
  }

  async updateUserStatus(userId: string, updates: { accountLocked?: boolean; isEmailVerified?: boolean }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (updates.accountLocked !== undefined) {
        user.accountLocked = updates.accountLocked;
      }
      if (updates.isEmailVerified !== undefined) {
        user.isEmailVerified = updates.isEmailVerified;
      }
      this.users.set(userId, user);
    }
  }
}

// Database storage implementation (commented out for demo - use MemStorage)
/*
class DatabaseStorageImpl implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Admin methods for platform management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions);
  }

  async getTaskCompletion(id: string): Promise<TaskCompletion | undefined> {
    const [completion] = await db.select().from(taskCompletions).where(eq(taskCompletions.id, id));
    return completion || undefined;
  }

  async updateTaskCompletionStatus(id: string, status: string, notes?: string): Promise<void> {
    const updateData: any = { status };
    if (notes) {
      updateData.submissionNotes = notes;
    }
    await db
      .update(taskCompletions)
      .set(updateData)
      .where(eq(taskCompletions.id, id));
  }

  async updateUserEarnings(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await db
        .update(users)
        .set({ earnings: (user.earnings || 0) + amount })
        .where(eq(users.id, userId));
    }
  }

  async updateUserStatus(userId: string, updates: { accountLocked?: boolean; isEmailVerified?: boolean }): Promise<void> {
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }

  // Stub methods for other required interface methods - implement as needed
  async getTaskCategories(): Promise<TaskCategory[]> { return []; }
  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> { throw new Error('Not implemented'); }
  async getTasks(): Promise<Task[]> { return []; }
  async getTask(id: string): Promise<Task | undefined> { return undefined; }
  async getTasksByCategory(categoryId: string): Promise<Task[]> { return []; }
  async createTask(task: InsertTask): Promise<Task> { throw new Error('Not implemented'); }
  async getTaskCompletions(userId: string): Promise<TaskCompletion[]> { return []; }
  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> { throw new Error('Not implemented'); }
  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> { return undefined; }
  async getMessages(userId: string): Promise<Message[]> { return []; }
  async createMessage(message: InsertMessage): Promise<Message> { throw new Error('Not implemented'); }
  async markMessageAsRead(id: string): Promise<void> {}
  async getUserAchievements(userId: string): Promise<UserAchievement[]> { return []; }
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> { throw new Error('Not implemented'); }
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> { return []; }
  async createAchievementDefinition(definition: InsertAchievementDefinition): Promise<AchievementDefinition> { throw new Error('Not implemented'); }
  async updateUserAchievementProgress(userId: string, achievementType: string, progress: number): Promise<UserAchievement | undefined> { return undefined; }
  async getDailyChallenges(): Promise<DailyChallenge[]> { return []; }
  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> { throw new Error('Not implemented'); }
  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> { return []; }
  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> { throw new Error('Not implemented'); }
  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> { return undefined; }
  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> { return []; }
  
  // Security and verification methods implementation for demo
  async getUserActivity(userId: string, hours: number): Promise<UserActivity[]> {
    // In demo mode, return simulated activity data
    return [
      {
        id: 1,
        userId: userId,
        activityType: "login",
        metadata: { ip: "192.168.1.1", userAgent: "Chrome" },
        riskScore: 0,
        flagged: false,
        createdAt: new Date()
      }
    ] as UserActivity[];
  }

  async logSuspiciousActivity(userId: string, activity: any): Promise<void> {
    // In demo mode, just log to console
    console.warn(`Suspicious activity logged for user ${userId}:`, activity);
  }
}
*/

// Using secure MemStorage for demo - in production use DatabaseStorage with proper DB setup
export const storage = new MemStorage();

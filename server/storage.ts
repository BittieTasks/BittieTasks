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
  type InsertAchievementDefinition
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private taskCategories: Map<string, TaskCategory>;
  private tasks: Map<string, Task>;
  private taskCompletions: Map<string, TaskCompletion>;
  private messages: Map<string, Message>;
  private userAchievements: Map<string, UserAchievement>;
  private achievementDefinitions: Map<string, AchievementDefinition>;

  constructor() {
    this.users = new Map();
    this.taskCategories = new Map();
    this.tasks = new Map();
    this.taskCompletions = new Map();
    this.messages = new Map();
    this.userAchievements = new Map();
    this.achievementDefinitions = new Map();
    
    this.initializeDefaultData();
    this.initializeAchievementDefinitions();
  }

  private initializeDefaultData() {
    // Create default user
    const userId = randomUUID();
    const defaultUser: User = {
      id: userId,
      username: "sarah_parent",
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Miller",
      profilePicture: null,
      totalEarnings: "347.50",
      rating: "4.8",
      completedTasks: 28,
      currentStreak: 5,
      skills: ["cooking", "organizing", "childcare"],
      availability: { weekdays: true, weekends: true, mornings: true, afternoons: true },
      createdAt: new Date()
    };
    this.users.set(userId, defaultUser);

    // Create task categories
    const categories = [
      { name: "Cooking", icon: "fa-utensils", color: "primary" },
      { name: "Cleaning", icon: "fa-broom", color: "secondary" },
      { name: "Childcare", icon: "fa-baby", color: "accent" },
      { name: "Organizing", icon: "fa-boxes", color: "purple" },
      { name: "Self-Care", icon: "fa-heart", color: "green" }
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
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      profilePicture: insertUser.profilePicture || null,
      totalEarnings: insertUser.totalEarnings || "0.00",
      rating: insertUser.rating || "5.0",
      completedTasks: insertUser.completedTasks || 0,
      currentStreak: insertUser.currentStreak || 0,
      skills: insertUser.skills || [],
      availability: insertUser.availability || { weekdays: true, weekends: true, mornings: true, afternoons: true },
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
}

export const storage = new MemStorage();

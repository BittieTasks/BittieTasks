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
  type InsertUserAchievement
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private taskCategories: Map<string, TaskCategory>;
  private tasks: Map<string, Task>;
  private taskCompletions: Map<string, TaskCompletion>;
  private messages: Map<string, Message>;
  private userAchievements: Map<string, UserAchievement>;

  constructor() {
    this.users = new Map();
    this.taskCategories = new Map();
    this.tasks = new Map();
    this.taskCompletions = new Map();
    this.messages = new Map();
    this.userAchievements = new Map();
    
    this.initializeDefaultData();
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
      { name: "Organizing", icon: "fa-boxes", color: "purple" }
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
      // Sponsored tasks - parents get paid regardless of neighbor participation
      {
        title: "Sponsored: Document Your Meal Prep",
        description: "Show your weekly meal prep routine! Get paid $55 to document and share your process - no neighbors needed!",
        payment: "55.00",
        duration: 45,
        difficulty: "Easy",
        requirements: ["Film clear before/after shots", "Include ingredient costs", "Share 3 family-friendly recipes", "Show storage tips"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Cooking",
        taskType: "sponsored",
        sponsorInfo: "Sponsored by FoodPrep App"
      },
      {
        title: "Sponsored: Your Kids' Learning Activities",
        description: "Get paid $45 to document fun educational activities you do with your kids - help other parents learn!",
        payment: "45.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Age-appropriate activities (2-6 years)", "Show materials needed", "Explain learning benefits", "Safety considerations"],
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "sponsored",
        sponsorInfo: "Sponsored by KidsLearn Platform"
      },
      {
        title: "Sponsored: Organization Transformation",
        description: "Earn $65 organizing any room in your house! Document the process and inspire other parents.",
        payment: "65.00",
        duration: 120,
        difficulty: "Medium",
        requirements: ["Before and after photos", "List products used", "Time-saving tips", "Budget breakdown"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: "Sponsored by HomeOrg Solutions"
      },
      // High-value shared tasks
      {
        title: "Weekend Meal Prep Service - 5 Families",
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
        title: "After School Care Hub - Premium Service",
        description: "Professional after-school care for 6 kids ages 5-12. Homework help, snacks, activities. $50/child for 3-hour daily care.",
        payment: "50.00",
        duration: 180,
        difficulty: "Hard",
        requirements: ["Background check verified", "Educational activities provided", "Homework supervision", "Healthy snacks included", "Weekly progress reports"],
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Childcare",
        taskType: "shared"
      },
      // Premium sponsored tasks
      {
        title: "Sponsored: Complete Home Organization Makeover",
        description: "Transform your entire home organization system! Document the full process for $120. Share tips, products, and before/after results.",
        payment: "120.00",
        duration: 480,
        difficulty: "Hard",
        requirements: ["Multiple rooms documentation", "Product recommendations", "Time-lapse videos", "Cost breakdown analysis", "30-day follow-up"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: "Sponsored by HomeMax Solutions"
      },
      {
        title: "Sponsored: Weekly Family Budget & Meal Planning",
        description: "Show how you plan meals and budget for a family of 4. Get paid $85 to share your complete system and money-saving strategies.",
        payment: "85.00",
        duration: 120,
        difficulty: "Medium",
        requirements: ["Budget spreadsheet template", "Weekly meal plan examples", "Grocery shopping strategy", "Cost-saving tips", "Family-friendly recipes"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: "Sponsored by FamilyFinance Pro"
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

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      totalEarnings: "0.00",
      rating: "0.00",
      completedTasks: 0,
      currentStreak: 0,
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
    const category: TaskCategory = { ...insertCategory, id };
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
      ...insertTask, 
      id, 
      rating: "0.00",
      completions: 0,
      isActive: true,
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
      ...insertCompletion, 
      id, 
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
      ...insertMessage, 
      id, 
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
      ...insertAchievement, 
      id, 
      earnedAt: new Date()
    };
    this.userAchievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();

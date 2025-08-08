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
      username: "dev_user",
      email: "dev@bittietasks.com",
      passwordHash: "demo_hash",
      firstName: "Development",
      lastName: "User",
      profilePicture: null,
      totalEarnings: "0.00",
      rating: "0.0",
      completedTasks: 0,
      currentStreak: 0,
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
      identityScore: 0
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
        title: "Solo Morning Walk & Mindfulness",
        description: "Start your day with a peaceful solo walk. Document your journey with photos and reflections. Invite accountability partners to earn together - they get paid too for joining and supporting your wellness goals!",
        payment: "15.00",
        duration: 30,
        difficulty: "Easy",
        requirements: ["Comfortable walking shoes", "Phone for photo documentation", "Journal for reflections", "Optional: invite accountability partners"],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f0c9e62f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "solo",
        allowAccountabilityPartners: true,
        maxPartners: 2,
        partnerPayment: "8.00"
      },
      {
        title: "Home Yoga & Meditation Session", 
        description: "Practice yoga and meditation at home. Document your session with photos and reflection notes. Invite friends as accountability partners - they earn $5 each for checking in and providing encouragement!",
        payment: "12.00",
        duration: 45,
        difficulty: "Easy", 
        requirements: ["Yoga mat or comfortable space", "Meditation app or quiet music", "Photo of setup", "5-minute reflection notes"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "solo",
        allowAccountabilityPartners: true,
        maxPartners: 3,
        partnerPayment: "5.00"
      },
      {
        title: "Healthy Meal Prep Sunday",
        description: "Prepare nutritious meals for the week. Share your meal prep photos and recipes. Accountability partners earn by helping you stay on track with meal planning goals!",
        payment: "20.00", 
        duration: 90,
        difficulty: "Medium",
        requirements: ["Fresh ingredients", "Meal prep containers", "Photos of prepped meals", "Recipe notes to share"],
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "solo",
        allowAccountabilityPartners: true,
        maxPartners: 2,
        partnerPayment: "7.00"
      },
      {
        title: "Personal Reading & Learning Hour",
        description: "Dedicate time to reading and personal development. Share book recommendations and key insights. Partners earn by engaging with your reading progress and sharing encouragement!",
        payment: "10.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Book or learning material", "Quiet reading space", "Reading notes or highlights", "Share insights with partners"],
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care", 
        taskType: "solo",
        allowAccountabilityPartners: true,
        maxPartners: 1,
        partnerPayment: "6.00"
      },
      {
        title: "Target Neighborhood Shopping Group",
        description: "Target pays $20 per participant for community shopping events! Join our weekly Target run, get exclusive coupons, and earn money for shopping. Target covers all participant payments plus provides additional rewards.",
        payment: "20.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Bring reusable bags", "RedCard members get extra discount", "Minimum $50 purchase to qualify", "Share shopping tips with group"],
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Target",
          brandDescription: "Target pays BittieTasks $35 per participant ($20 to you + $15 platform fee) to drive community shopping engagement and gather customer insights",
          specialReward: "$5 Target gift card + exclusive weekly coupons",
          brandColor: "#CC0000",
          ethicalStanding: "Target scores 100/100 on HRC Corporate Equality Index for LGBTQ+ workplace equality and has strong DEI commitments"
        }
      },
      {
        title: "McDonald's Family Breakfast Test",
        description: "McDonald's is paying families $30 each to try their new breakfast menu items and provide feedback. They cover all food costs plus your participation fee. Perfect for families with kids!",
        payment: "30.00",
        duration: 45,
        difficulty: "Easy",
        requirements: ["Family with kids ages 3-12", "Try 3 new breakfast items", "Complete detailed feedback survey", "Share photos (optional)"],
        imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "McDonald's",
          brandDescription: "McDonald's pays $45 per family ($30 to participants + $15 platform fee) for authentic family feedback on new breakfast products",
          specialReward: "Free breakfast for the family + $10 McDonald's gift card",
          brandColor: "#FFC72C"
        }
      },
      {
        title: "Home Depot DIY Workshop",
        description: "Home Depot sponsors hands-on DIY workshops for parents! Learn new skills, get free materials, and earn money for attending. They pay for your time plus provide all tools and supplies.",
        payment: "35.00",
        duration: 180,
        difficulty: "Medium",
        requirements: ["Must be 18+ years old", "Bring safety glasses if you have them", "Stay for full workshop", "Complete project take-home"],
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Home Depot",
          brandDescription: "Home Depot invests $55 per participant ($35 payment + $20 materials/platform fee) to build customer loyalty and demonstrate products",
          specialReward: "Free DIY kit to take home + 15% off next purchase",
          brandColor: "#F96302"
        }
      },
      {
        title: "Amazon Prime Family Movie Night",
        description: "Amazon Prime Video pays families $25 to watch and review new family movies! Get paid to have movie night, plus free snacks and exclusive early access to upcoming releases.",
        payment: "25.00",
        duration: 120,
        difficulty: "Easy",
        requirements: ["Amazon Prime subscription", "Family with kids", "Complete movie review survey", "Rate content appropriateness"],
        imageUrl: "https://images.unsplash.com/photo-1489599162731-83d8d6057604?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Amazon Prime",
          brandDescription: "Amazon pays $40 per family ($25 to participants + $15 platform fee) for authentic family entertainment feedback",
          specialReward: "Free movie rental credit + early access to new releases",
          brandColor: "#FF9900"
        }
      },
      {
        title: "Nike Family Fitness Challenge",
        description: "Nike sponsors active families! Complete a 30-minute family workout, test new Nike gear, and earn $28 per person. Perfect way to stay active together while earning money!",
        payment: "28.00",
        duration: 45,
        difficulty: "Medium",
        requirements: ["Family of 3+ members", "Age range 8-50", "Complete workout video", "Test Nike products", "Share fitness photos"],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f0c9e62f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Nike",
          brandDescription: "Nike invests $43 per participant ($28 payment + $15 platform fee) to promote family fitness and test new product lines",
          specialReward: "Nike gear sample + 20% off family fitness products",
          brandColor: "#000000",
          ethicalStanding: "Nike scores 90/100 on HRC index, champions equality through sport, and has committed $40M to organizations supporting Black communities"
        }
      },
      {
        title: "Disney+ Family Content Preview",
        description: "Disney+ pays families $22 to preview upcoming shows and movies! Watch exclusive content before it releases and provide family-friendly feedback. Kids love being Disney testers!",
        payment: "22.00",
        duration: 90,
        difficulty: "Easy",
        requirements: ["Disney+ subscription", "Children ages 4-14", "Watch full episode/movie", "Complete family survey", "Rate age-appropriateness"],
        imageUrl: "https://images.unsplash.com/photo-1489599162731-83d8d6057604?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Self-Care",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Disney+",
          brandDescription: "Disney pays $37 per family ($22 to participants + $15 platform fee) for valuable family entertainment insights and content testing",
          specialReward: "Exclusive Disney merchandise + free month of Disney+",
          brandColor: "#1E3A8A"
        }
      },
      {
        title: "Costco Bulk Shopping Family Test",
        description: "Costco sponsors family shopping experiences! Test new bulk family products, get exclusive samples, and earn $32 for providing feedback on family-sized items and shopping experience.",
        payment: "32.00",
        duration: 60,
        difficulty: "Easy",
        requirements: ["Costco membership", "Family of 4+ members", "Test 5 new products", "Minimum $100 purchase", "Complete detailed survey"],
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Costco",
          brandDescription: "Costco invests $47 per family ($32 payment + $15 platform fee) to understand bulk buying patterns and family preferences",
          specialReward: "$10 Costco cash card + exclusive member coupons",
          brandColor: "#E31837"
        }
      },
      {
        title: "Apple Family Tech Setup Workshop",
        description: "Apple pays families $40 to learn and test new family tech features! Get hands-on training with iPads, parental controls, and family sharing. Perfect for tech-curious families!",
        payment: "40.00",
        duration: 120,
        difficulty: "Medium",
        requirements: ["Apple device ownership", "Parents + kids (ages 6+)", "Complete tech tutorial", "Test family features", "Provide usability feedback"],
        imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        categoryName: "Organizing",
        taskType: "sponsored",
        sponsorInfo: {
          brandName: "Apple",
          brandDescription: "Apple invests $60 per family ($40 payment + $20 platform fee) to improve family technology experiences and gather user insights",
          specialReward: "Apple accessories bundle + exclusive beta access",
          brandColor: "#1D1D1F",
          ethicalStanding: "Apple scores 100/100 on HRC index, carbon neutral by 2030, and has strong supplier diversity programs supporting minority-owned businesses"
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
          rating: "0.0",
          completions: 0,
          isActive: true,
          taskType: (taskData as any).taskType || "shared",
          sponsorInfo: (taskData as any).sponsorInfo || null,
          paymentType: "cash",
          allowAccountabilityPartners: (taskData as any).allowAccountabilityPartners || false,
          maxPartners: (taskData as any).maxPartners || 0,
          partnerPayment: (taskData as any).partnerPayment || "0.00",
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

  // Method to update user ad preferences
  async updateUserAdPreferences(userId: string, preferences: {
    adFrequency?: number;
    adRelevance?: number;
    adTypes?: string[];
    adCategories?: string[];
    maxAdBudget?: number;
    minAdBudget?: number;
    familyFriendlyOnly?: boolean;
    localAdsOnly?: boolean;
    ethicalAdsOnly?: boolean;
    adPersonalization?: boolean;
  }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...preferences
    };
    this.users.set(userId, updatedUser);
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

  // Human verification methods for MemStorage
  async updateUserVerification(userId: string, verificationData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    Object.assign(user, verificationData);
    this.users.set(userId, user);
    return user;
  }

  async getUserVerificationStatus(userId: string): Promise<any> {
    const user = this.users.get(userId);
    if (!user) return null;

    return {
      overallScore: user.identityScore || 0,
      level: user.humanVerificationLevel || 'basic',
      verifications: {
        email: user.isEmailVerified || false,
        phone: user.isPhoneVerified || false,
        identity: user.governmentIdVerified || false,
        face: user.faceVerificationCompleted || false,
        behavior: (user.behaviorScore || 0) > 70,
        captcha: user.isCaptchaVerified || false,
        twoFactor: user.twoFactorEnabled || false
      },
      requirements: [],
      riskLevel: (user.riskScore || 0) > 50 ? 'high' : (user.riskScore || 0) > 20 ? 'medium' : 'low'
    };
  }

  async logVerificationActivity(userId: string, activityType: string, metadata?: any): Promise<void> {
    console.log(`Verification activity: ${activityType} for user ${userId}`, metadata);
  }

  async incrementRiskScore(userId: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.riskScore = (user.riskScore || 0) + amount;
      this.users.set(userId, user);
    }
  }

  async lockUserAccount(userId: string, reason: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.accountLocked = true;
      user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      this.users.set(userId, user);
    }
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

  // Barter transaction storage
  private barterTransactions: any[] = [];

  async getBarterTasks(): Promise<Task[]> {
    const allTasks = await this.getTasks();
    return allTasks.filter(task => task.paymentType === "barter" && task.isActive);
  }

  async createBarterTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: randomUUID(),
      createdAt: new Date(),
      ...task
    };
    // Use the existing createTask method instead of direct array manipulation
    return await this.createTask(newTask);
  }

  async createBarterTransaction(transaction: any): Promise<any> {
    const newTransaction = {
      id: randomUUID(),
      createdAt: new Date(),
      ...transaction
    };
    this.barterTransactions.push(newTransaction);
    return newTransaction;
  }

  async getUserBarterTransactions(userId: string): Promise<any[]> {
    return this.barterTransactions.filter(
      transaction => transaction.offererId === userId || transaction.accepterId === userId
    );
  }

  async updateBarterTransaction(id: string, updates: any): Promise<any> {
    const index = this.barterTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.barterTransactions[index] = { ...this.barterTransactions[index], ...updates };
      return this.barterTransactions[index];
    }
    return null;
  }

  async ensureBarterCategory(): Promise<void> {
    const categories = await this.getTaskCategories();
    const barterCategory = categories.find(cat => cat.id === "barter");
    if (!barterCategory) {
      await this.createTaskCategory({
        id: "barter",
        name: "Barter Exchange",
        icon: "handshake",
        color: "#10b981",
        description: "Trade skills, services, and time with community members"
      });
    }
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getAllTaskCompletions(): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions);
  }
}

// Security enhancement: Using PostgreSQL database for production security
import { db } from "./db";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { users, tasks, taskCategories, taskCompletions, messages, userAchievements, achievementDefinitions, dailyChallenges, userChallenges } from "@shared/schema";

export class DatabaseStorage {
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
    try {
      // Create complete user data with all required fields
      const userData = {
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
        availability: insertUser.availability || null,
        isEmailVerified: insertUser.isEmailVerified || false,
        emailVerificationToken: insertUser.emailVerificationToken || null,
        passwordResetToken: insertUser.passwordResetToken || null,
        passwordResetExpires: insertUser.passwordResetExpires || null,
        lastLogin: insertUser.lastLogin || null,
        failedLoginAttempts: insertUser.failedLoginAttempts || 0,
        accountLocked: insertUser.accountLocked || false,
        lockUntil: insertUser.lockUntil || null,
        // Set defaults for required fields not in InsertUser
        isPhoneVerified: false,
        isIdentityVerified: false,
        isBackgroundChecked: false,
        phoneNumber: null,
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

      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error('DatabaseStorage.createUser error:', error);
      throw new Error('Failed to create user in database');
    }
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

  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return await db.select().from(dailyChallenges);
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db
      .insert(dailyChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async getUserChallenges(userId: string, date?: Date): Promise<UserChallenge[]> {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }

  async assignDailyChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const [newChallenge] = await db
      .insert(userChallenges)
      .values({
        id: randomUUID(),
        userId,
        challengeId,
        status: 'assigned',
        assignedAt: new Date(),
        completed: false,
      })
      .returning();
    return newChallenge;
  }

  async completeChallenge(userChallengeId: string, reflection?: string): Promise<UserChallenge | undefined> {
    const [completed] = await db
      .update(userChallenges)
      .set({ 
        status: 'completed', 
        completed: true, 
        completedAt: new Date(),
        reflection 
      })
      .where(eq(userChallenges.id, userChallengeId))
      .returning();
    return completed || undefined;
  }

  async getTodaysChallenges(userId: string): Promise<UserChallenge[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await db.select().from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        gte(userChallenges.assignedAt, today)
      ));
  }

  // Security and verification methods
  async getUserActivity(userId: string, hours: number): Promise<any[]> {
    // Return empty array for now - can be enhanced with actual user activity table
    return [];
  }

  async logSuspiciousActivity(userId: string, activity: any): Promise<void> {
    console.warn(`Suspicious activity logged for user ${userId}:`, activity);
  }

  async updateUserVerification(userId: string, verificationData: Partial<User>): Promise<User | undefined> {
    return await this.updateUser(userId, verificationData);
  }

  async getUserVerificationStatus(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    return {
      isEmailVerified: user?.isEmailVerified || false,
      isPhoneVerified: user?.isPhoneVerified || false,
      isIdentityVerified: user?.isIdentityVerified || false,
      isBackgroundChecked: user?.isBackgroundChecked || false
    };
  }

  async logVerificationActivity(userId: string, activityType: string, metadata?: any): Promise<void> {
    console.log(`Verification activity: ${activityType} for user ${userId}`, metadata);
  }

  async incrementRiskScore(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const newRiskScore = (user.riskScore || 0) + amount;
      await this.updateUser(userId, { riskScore: newRiskScore });
    }
  }

  async lockUserAccount(userId: string, reason: string): Promise<void> {
    await this.updateUser(userId, { 
      accountLocked: true, 
      lockUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  initializeDailyChallenges(): void {
    // Initialize challenges asynchronously
    setTimeout(() => this.createDefaultChallenges(), 100);
  }

  private async createDefaultChallenges(): Promise<void> {
    // Create sample challenges if none exist
    const existing = await this.getDailyChallenges();
    if (existing.length === 0) {
      await this.createDailyChallenge({
        id: randomUUID(),
        title: "Quick Walk",
        description: "Take a 10-minute walk around your neighborhood",
        category: "wellness",
        difficulty: "easy",
        rewardPoints: 10,
        icon: "🚶‍♀️",
        color: "#10b981",
        estimatedMinutes: 10,
        isActive: true
      });
    }
  }

  async ensureBarterCategory(): Promise<void> {
    const existing = await db.select().from(taskCategories).where(eq(taskCategories.id, 'barter'));
    if (existing.length === 0) {
      await this.createTaskCategory({
        id: 'barter',
        name: 'Barter & Trade',
        icon: 'handshake',
        color: '#10b981',
        description: 'Trade skills, services, and time with community members'
      });
    }
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
    await db
      .update(taskCompletions)
      .set({ status: status as any, submissionNotes: notes })
      .where(eq(taskCompletions.id, id));
  }

  async updateUserEarnings(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ totalEarnings: sql`COALESCE(total_earnings, 0) + ${amount}` })
      .where(eq(users.id, userId));
  }

  async updateUserStatus(userId: string, updates: { accountLocked?: boolean; isEmailVerified?: boolean }): Promise<void> {
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }
}

// Using DatabaseStorage for production - proper database persistence
export const storage = new DatabaseStorage();

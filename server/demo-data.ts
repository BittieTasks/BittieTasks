// Demo data for development - this will be replaced with Supabase data once connection is established
import { type User, type Task, type TaskCategory } from "@shared/schema";

export const demoUsers: User[] = [];

export const demoCategories: TaskCategory[] = [
  {
    id: "cooking",
    name: "Cooking",
    description: "Food preparation and cooking tasks",
    icon: "fa-utensils", 
    color: "#ef4444"
  },
  {
    id: "cleaning",
    name: "Cleaning", 
    description: "Home and office cleaning tasks",
    icon: "fa-broom",
    color: "#10b981"
  },
  {
    id: "childcare",
    name: "Childcare",
    description: "Child supervision and care", 
    icon: "fa-baby",
    color: "#f59e0b"
  },
  {
    id: "exercise", 
    name: "Exercise",
    description: "Fitness and physical activity",
    icon: "fa-dumbbell",
    color: "#8b5cf6"
  },
  {
    id: "errands",
    name: "Errands", 
    description: "Shopping and errand running",
    icon: "fa-car",
    color: "#06b6d4"
  },
  {
    id: "selfcare",
    name: "Self Care",
    description: "Personal wellness and self-care",
    icon: "fa-heart", 
    color: "#ec4899"
  }
];

export const demoTasks: Task[] = [
  {
    id: "demo-cooking-1",
    title: "Prep Family Breakfast",
    description: "Help prep healthy breakfast for 4 people. Tasks include chopping fruit, making oatmeal, and setting table.",
    categoryId: "cooking",
    payment: "15.00",
    duration: 45,
    difficulty: "Easy",
    requirements: [],
    imageUrl: null,
    rating: "4.8",
    completions: 23,
    isActive: true,
    taskType: "shared",
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
    createdAt: new Date()
  },
  {
    id: "demo-cleaning-1", 
    title: "Quick Home Tidy",
    description: "Help tidy living room, kitchen, and one bathroom. Light cleaning and organizing.",
    categoryId: "cleaning",
    payment: "20.00",
    duration: 60,
    difficulty: "Easy", 
    requirements: [],
    imageUrl: null,
    rating: "4.6",
    completions: 18,
    isActive: true,
    taskType: "shared",
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
    createdAt: new Date()
  },
  {
    id: "demo-selfcare-1",
    title: "Morning Meditation",
    description: "Solo meditation practice with optional accountability partner for encouragement.",
    categoryId: "selfcare", 
    payment: "5.00",
    duration: 20,
    difficulty: "Easy",
    requirements: [],
    imageUrl: null,
    rating: "4.9",
    completions: 45,
    isActive: true,
    taskType: "solo", 
    sponsorInfo: null,
    paymentType: "cash",
    barterOffered: null,
    barterWanted: null,
    estimatedValue: null,
    barterCategory: null,
    allowAccountabilityPartners: true,
    maxPartners: 2,
    partnerPayment: "2.00", 
    flexibleBarter: false,
    createdAt: new Date()
  }
];
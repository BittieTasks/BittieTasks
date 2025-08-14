// BittieTasks Platform-Funded Tasks - AI-Verified $2 Payouts
// 5 curated tasks with intelligent photo verification system

// Note: Other task categories (peer-to-peer, corporate sponsored) temporarily disabled for testing
// Full marketplace with 110+ tasks will be re-enabled after AI verification testing

export const comprehensiveTasks = [
  // BITTIETASKS PLATFORM FUNDED TASKS (5 tasks) - Real $2 payouts, max 2 completions each
  {
    id: 'platform-001',
    title: 'Laundry Day',
    description: 'Complete a full load of laundry: wash, dry, and fold. Share a photo of your neatly folded clean clothes.',
    category: 'Home Organization',
    type: 'solo',
    payout: 2,
    max_participants: 1,
    current_participants: 0,
    deadline: '2025-02-28',
    location: 'Your Home',
    time_commitment: '2 hours',
    requirements: ['Access to washer/dryer', 'Photo verification'],
    sponsored: false,
    platform_funded: true,
    completion_limit: 2,
    verification_type: 'photo'
  },
  {
    id: 'platform-002',
    title: 'Kitchen Clean-Up',
    description: 'Wash all dishes and clean kitchen counters. Take before/after photos showing your sparkling clean kitchen.',
    category: 'Home Organization',
    type: 'solo',
    payout: 2,
    max_participants: 1,
    current_participants: 0,
    deadline: '2025-02-28',
    location: 'Your Home',
    time_commitment: '30 minutes',
    requirements: ['Kitchen access', 'Before/after photos'],
    sponsored: false,
    platform_funded: true,
    completion_limit: 2,
    verification_type: 'photo'
  },
  {
    id: 'platform-003',
    title: 'Pilates Session',
    description: 'Complete a 30-minute pilates workout. Share a photo or video of you doing pilates poses.',
    category: 'Health & Fitness',
    type: 'solo',
    payout: 2,
    max_participants: 1,
    current_participants: 0,
    deadline: '2025-02-28',
    location: 'Your Home or Studio',
    time_commitment: '30 minutes',
    requirements: ['Exercise mat', 'Workout verification photo/video'],
    sponsored: false,
    platform_funded: true,
    completion_limit: 2,
    verification_type: 'photo'
  },
  {
    id: 'platform-004',
    title: 'Grocery Run',
    description: 'Pick up essential groceries for the week. Share a photo of your grocery haul or receipt.',
    category: 'Transportation',
    type: 'solo',
    payout: 2,
    max_participants: 1,
    current_participants: 0,
    deadline: '2025-02-28',
    location: 'Local Grocery Store',
    time_commitment: '1 hour',
    requirements: ['Transportation to store', 'Receipt or grocery photo'],
    sponsored: false,
    platform_funded: true,
    completion_limit: 2,
    verification_type: 'photo'
  },
  {
    id: 'platform-005',
    title: 'Room Organization',
    description: 'Organize and tidy one room in your home. Take before and after photos showing the transformation.',
    category: 'Home Organization',
    type: 'solo',
    payout: 2,
    max_participants: 1,
    current_participants: 0,
    deadline: '2025-02-28',
    location: 'Your Home',
    time_commitment: '1 hour',
    requirements: ['Before/after photos', 'Room access'],
    sponsored: false,
    platform_funded: true,
    completion_limit: 2,
    verification_type: 'photo'
  }
]

// Helper function to get tasks by category
export function getTasksByCategory(category: string) {
  return comprehensiveTasks.filter(task => task.category === category)
}

// Helper function to get tasks by type
export function getTasksByType(type: string) {
  return comprehensiveTasks.filter(task => task.type === type)
}

// Helper function to get platform-funded tasks
export function getPlatformFundedTasks() {
  return comprehensiveTasks.filter(task => task.platform_funded === true)
}

// Get all available categories
export const categories = [...new Set(comprehensiveTasks.map(task => task.category))]

// Get task counts by category
export const categoryStats = categories.map(category => ({
  category,
  count: getTasksByCategory(category).length,
  totalPayout: getTasksByCategory(category).reduce((sum, task) => sum + task.payout, 0)
}))
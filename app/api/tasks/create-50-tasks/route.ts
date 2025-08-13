import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Generate 50 diverse platform-funded tasks
const generate50Tasks = () => {
  const taskTemplates = [
    // Home Organization (12 tasks)
    { title: 'Organize Kids\' Artwork Portfolio', description: 'Create a digital portfolio system for children\'s artwork with sorting and storage tips.', earning: 35, category: 'Home Organization', duration: '2-3 hours', participants: 10 },
    { title: 'Pantry Organization System', description: 'Design an efficient pantry organization system with clear labeling for easy meal planning.', earning: 28, category: 'Home Organization', duration: '2-3 hours', participants: 12 },
    { title: 'Closet Space Maximization', description: 'Create smart closet storage solutions and seasonal rotation systems.', earning: 32, category: 'Home Organization', duration: '3-4 hours', participants: 8 },
    { title: 'Toy Rotation System', description: 'Organize toys to reduce clutter and increase engagement through strategic rotation.', earning: 26, category: 'Home Organization', duration: '2-3 hours', participants: 15 },
    { title: 'Digital Photo Organization', description: 'Create a family photo organization system with cloud storage and easy retrieval.', earning: 30, category: 'Home Organization', duration: '3-4 hours', participants: 10 },
    { title: 'Garage Storage Solutions', description: 'Transform garage space into organized storage with seasonal access systems.', earning: 38, category: 'Home Organization', duration: '4-5 hours', participants: 6 },
    { title: 'Kitchen Cabinet Organization', description: 'Optimize kitchen cabinet space for efficient cooking and easy maintenance.', earning: 29, category: 'Home Organization', duration: '2-3 hours', participants: 12 },
    { title: 'Kids\' Room Organization', description: 'Create functional and fun organization systems that kids can maintain themselves.', earning: 33, category: 'Home Organization', duration: '3-4 hours', participants: 9 },
    { title: 'Home Office Setup', description: 'Design productive home office spaces in small areas with storage solutions.', earning: 36, category: 'Home Organization', duration: '3-4 hours', participants: 8 },
    { title: 'Bathroom Organization', description: 'Maximize bathroom storage with smart solutions for toiletries and linens.', earning: 25, category: 'Home Organization', duration: '2 hours', participants: 14 },
    { title: 'Laundry Room Efficiency', description: 'Create systems for sorting, washing, and folding that save time and space.', earning: 31, category: 'Home Organization', duration: '2-3 hours', participants: 11 },
    { title: 'Basement Storage System', description: 'Transform basement into organized storage with moisture protection and accessibility.', earning: 34, category: 'Home Organization', duration: '4-5 hours', participants: 7 },

    // Meal Planning & Cooking (12 tasks)
    { title: 'Weekly Meal Prep System', description: 'Develop efficient meal prep routines that save 30+ minutes daily.', earning: 42, category: 'Meal Planning', duration: '4-5 hours', participants: 8 },
    { title: 'Budget Grocery Shopping', description: 'Create systems for saving 30% on groceries while maintaining nutrition quality.', earning: 35, category: 'Meal Planning', duration: '3 hours', participants: 12 },
    { title: 'Healthy Lunch Box Ideas', description: 'Develop 20 creative, nutritious lunch ideas that kids actually want to eat.', earning: 32, category: 'Meal Planning', duration: '3-4 hours', participants: 15 },
    { title: 'After-School Snack Prep', description: 'Create healthy snacks that can be prepped in advance with nutritional information.', earning: 28, category: 'Meal Planning', duration: '2-3 hours', participants: 18 },
    { title: 'Family Dinner Planning', description: 'Design weekly dinner systems that please all family members and dietary needs.', earning: 38, category: 'Meal Planning', duration: '3-4 hours', participants: 10 },
    { title: 'Breakfast Prep Solutions', description: 'Create grab-and-go breakfast options that are nutritious and kid-friendly.', earning: 30, category: 'Meal Planning', duration: '2-3 hours', participants: 14 },
    { title: 'Freezer Meal Planning', description: 'Develop freezer meal systems that maintain quality and save money.', earning: 36, category: 'Meal Planning', duration: '4-5 hours', participants: 9 },
    { title: 'Kitchen Meal Prep Setup', description: 'Organize kitchen tools and spaces for efficient meal preparation workflows.', earning: 29, category: 'Meal Planning', duration: '2-3 hours', participants: 11 },
    { title: 'Special Diet Meal Plans', description: 'Create meal systems for gluten-free, vegetarian, or allergy-friendly families.', earning: 40, category: 'Meal Planning', duration: '4-5 hours', participants: 7 },
    { title: 'One-Pot Family Meals', description: 'Develop easy one-pot recipes that minimize cleanup while maximizing nutrition.', earning: 33, category: 'Meal Planning', duration: '3 hours', participants: 13 },
    { title: 'Seasonal Meal Planning', description: 'Create seasonal menu systems using local produce and holiday traditions.', earning: 37, category: 'Meal Planning', duration: '3-4 hours', participants: 8 },
    { title: 'Quick Dinner Solutions', description: 'Design 15-minute dinner recipes for busy weeknight family meals.', earning: 31, category: 'Meal Planning', duration: '2-3 hours', participants: 16 },

    // Education & Learning (10 tasks)
    { title: 'Reading Comprehension Activities', description: 'Create engaging activities that improve reading skills for elementary students.', earning: 45, category: 'Education', duration: '4-5 hours', participants: 6 },
    { title: 'Math Practice Games', description: 'Develop fun games that make memorizing multiplication tables enjoyable.', earning: 52, category: 'Education', duration: '5-6 hours', participants: 5 },
    { title: 'Science Experiment Kit', description: 'Design safe, educational science experiments using household items.', earning: 48, category: 'Education', duration: '4-5 hours', participants: 7 },
    { title: 'Creative Writing Prompts', description: 'Develop writing prompts that inspire creativity in children ages 6-12.', earning: 38, category: 'Education', duration: '3-4 hours', participants: 10 },
    { title: 'Educational Board Games', description: 'Create learning games that make education fun for family game nights.', earning: 41, category: 'Education', duration: '4-5 hours', participants: 8 },
    { title: 'Homework Organization System', description: 'Design systems that help kids manage homework independently.', earning: 35, category: 'Education', duration: '3 hours', participants: 12 },
    { title: 'Learning Through Crafts', description: 'Combine education with hands-on crafts for kinesthetic learners.', earning: 39, category: 'Education', duration: '4 hours', participants: 9 },
    { title: 'Geography Learning Games', description: 'Make world geography exciting through interactive games and activities.', earning: 36, category: 'Education', duration: '3-4 hours', participants: 11 },
    { title: 'History Timeline Activities', description: 'Create engaging ways to learn historical events through visual timelines.', earning: 42, category: 'Education', duration: '4-5 hours', participants: 7 },
    { title: 'Foreign Language Learning', description: 'Develop fun methods for introducing foreign languages to children.', earning: 44, category: 'Education', duration: '4-5 hours', participants: 6 },

    // Health & Fitness (8 tasks)
    { title: 'Family Fitness Routine', description: 'Create exercise programs that families can do together in small spaces.', earning: 45, category: 'Health & Fitness', duration: '4-5 hours', participants: 6 },
    { title: 'Indoor Exercise Circuits', description: 'Design equipment-free workouts for busy parents to do at home.', earning: 33, category: 'Health & Fitness', duration: '3 hours', participants: 12 },
    { title: 'Kids Yoga and Mindfulness', description: 'Develop age-appropriate yoga sequences that help children focus and relax.', earning: 38, category: 'Health & Fitness', duration: '3-4 hours', participants: 10 },
    { title: 'Outdoor Family Activities', description: 'Create seasonal outdoor activity plans that get families moving together.', earning: 35, category: 'Health & Fitness', duration: '3-4 hours', participants: 11 },
    { title: 'Healthy Habit Tracking', description: 'Design systems for families to track and reward healthy lifestyle choices.', earning: 32, category: 'Health & Fitness', duration: '2-3 hours', participants: 14 },
    { title: 'Sports Skills Practice', description: 'Create backyard training routines for common youth sports skills.', earning: 36, category: 'Health & Fitness', duration: '3-4 hours', participants: 9 },
    { title: 'Dance and Movement', description: 'Develop fun dance routines that get kids active and improve coordination.', earning: 31, category: 'Health & Fitness', duration: '2-3 hours', participants: 15 },
    { title: 'Walking and Hiking Plans', description: 'Create family-friendly walking routes and nature exploration activities.', earning: 29, category: 'Health & Fitness', duration: '2-3 hours', participants: 16 },

    // Self-Care & Wellness (8 tasks)  
    { title: 'Morning Routine Optimization', description: 'Design 15-minute morning routines that reduce stress and increase energy.', earning: 30, category: 'Self-Care', duration: '2-3 hours', participants: 18 },
    { title: 'Evening Wind-Down Rituals', description: 'Create calming evening routines that help families transition to bedtime.', earning: 28, category: 'Self-Care', duration: '2-3 hours', participants: 20 },
    { title: 'Mindfulness for Parents', description: 'Develop quick mindfulness exercises that fit into busy parenting schedules.', earning: 35, category: 'Self-Care', duration: '3 hours', participants: 12 },
    { title: 'Stress Management Techniques', description: 'Create practical stress-relief methods for overwhelmed parents.', earning: 37, category: 'Self-Care', duration: '3-4 hours', participants: 10 },
    { title: 'Family Meditation Practice', description: 'Design age-appropriate meditation sessions for the whole family.', earning: 33, category: 'Self-Care', duration: '3 hours', participants: 13 },
    { title: 'Self-Care Schedule Planning', description: 'Help parents carve out realistic self-care time in busy schedules.', earning: 32, category: 'Self-Care', duration: '2-3 hours', participants: 15 },
    { title: 'Gratitude Practice Systems', description: 'Create family gratitude practices that build positive mindsets.', earning: 26, category: 'Self-Care', duration: '2 hours', participants: 22 },
    { title: 'Digital Wellness Plans', description: 'Develop healthy screen time and digital wellness practices for families.', earning: 34, category: 'Self-Care', duration: '3 hours', participants: 14 }
  ]

  return taskTemplates.map((task, index) => ({
    title: task.title,
    description: task.description,
    earning_potential: task.earning,
    location: 'Remote/Home',
    duration: task.duration,
    max_participants: task.participants,
    current_participants: 0,
    status: 'open',
    approval_status: 'approved',
    host_id: 'platform-system'
  }))
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating 50 platform-funded tasks...')

    // Generate the 50 tasks
    const tasks = generate50Tasks()
    
    console.log(`Generated ${tasks.length} tasks for creation`)

    // Insert tasks in batches to avoid timeout
    const batchSize = 10
    const insertedTasks = []
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize)
      
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tasks.length/batchSize)}...`)
      
      const { data: batchData, error: batchError } = await supabase
        .from('tasks')
        .insert(batch)
        .select()

      if (batchError) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, batchError)
        return NextResponse.json({
          success: false,
          error: `Failed to insert task batch ${Math.floor(i/batchSize) + 1}`,
          details: batchError,
          tasks_created_so_far: insertedTasks.length
        }, { status: 500 })
      }
      
      insertedTasks.push(...(batchData || []))
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed: ${batchData?.length || 0} tasks`)
    }

    const totalValue = insertedTasks.reduce((sum, task) => sum + task.earning_potential, 0)
    const maxPotential = insertedTasks.reduce((sum, task) => sum + (task.earning_potential * task.max_participants), 0)

    console.log(`🎉 Successfully created ${insertedTasks.length} platform-funded tasks!`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks.length} platform-funded tasks`,
      tasks_created: insertedTasks.length,
      categories: {
        'Home Organization': 12,
        'Meal Planning': 12,  
        'Education': 10,
        'Health & Fitness': 8,
        'Self-Care': 8
      },
      financial_impact: {
        total_task_value: totalValue,
        max_monthly_potential: maxPotential,
        avg_task_value: Math.round(totalValue / insertedTasks.length),
        budget_utilization: `${Math.round(totalValue / 8000 * 100)}% of $8,000 monthly budget`
      },
      marketplace_status: 'BittieTasks now has a full task marketplace ready for users!'
    })

  } catch (error) {
    console.error('50-task creation error:', error)
    return NextResponse.json({
      success: false,
      error: '50-task creation failed',
      details: error
    }, { status: 500 })
  }
}
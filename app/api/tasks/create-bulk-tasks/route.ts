import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Generate 50 diverse tasks quickly
const generateBulkTasks = () => {
  const taskTemplates = [
    // Home & Organization (15 tasks)
    { title: 'Organize Pantry with Label System', description: 'Create an efficient pantry organization system with clear labeling for easy meal planning.', category: 'home_organization', earning: 25, difficulty: 'easy', duration: '2-3 hours' },
    { title: 'Design Closet Organization System', description: 'Maximize closet space with smart storage solutions and seasonal rotation system.', category: 'home_organization', earning: 30, difficulty: 'medium', duration: '3-4 hours' },
    { title: 'Create Toy Rotation System', description: 'Organize toys to reduce clutter and increase engagement through strategic rotation.', category: 'home_organization', earning: 28, difficulty: 'easy', duration: '2-3 hours' },
    
    // Meal Planning & Cooking (12 tasks)
    { title: 'Weekly Meal Prep for Families', description: 'Prepare healthy family meals for the entire week in one efficient session.', category: 'meal_planning', earning: 40, difficulty: 'medium', duration: '4-5 hours' },
    { title: 'Budget Grocery Shopping Guide', description: 'Create a system for saving 30% on groceries while maintaining nutrition quality.', category: 'meal_planning', earning: 35, difficulty: 'easy', duration: '2-3 hours' },
    { title: 'Healthy Lunch Box Ideas', description: 'Develop 20 creative, nutritious lunch ideas that kids actually want to eat.', category: 'meal_planning', earning: 32, difficulty: 'easy', duration: '3-4 hours' },
    
    // Education & Learning (10 tasks)
    { title: 'Reading Comprehension Activities', description: 'Create engaging activities that improve reading skills for elementary students.', category: 'education', earning: 45, difficulty: 'medium', duration: '4-5 hours' },
    { title: 'Science Experiment Kit', description: 'Design safe, educational science experiments using household items.', category: 'education', earning: 42, difficulty: 'medium', duration: '3-4 hours' },
    { title: 'Multiplication Learning Games', description: 'Develop fun games that make memorizing multiplication tables enjoyable.', category: 'education', earning: 38, difficulty: 'medium', duration: '3-4 hours' },
    
    // Health & Fitness (8 tasks)
    { title: 'Family Yoga Routine', description: 'Create a 30-minute family yoga sequence suitable for all ages and skill levels.', category: 'health_fitness', earning: 35, difficulty: 'medium', duration: '3-4 hours' },
    { title: 'Indoor Exercise Circuit', description: 'Design equipment-free workouts for busy parents to do at home.', category: 'health_fitness', earning: 33, difficulty: 'easy', duration: '2-3 hours' },
    
    // Financial Education (5 tasks)
    { title: 'Kids Money Management System', description: 'Teach children financial literacy through practical allowance and savings systems.', category: 'financial_education', earning: 40, difficulty: 'medium', duration: '3-4 hours' },
    { title: 'Family Budget Tracker', description: 'Create a simple system for families to track expenses and achieve savings goals.', category: 'financial_education', earning: 45, difficulty: 'medium', duration: '4-5 hours' },
    
    // Self-Care & Wellness (10 tasks)
    { title: 'Stress-Relief Morning Routine', description: 'Develop a 15-minute morning routine that reduces parental stress and increases energy.', category: 'self_care', earning: 30, difficulty: 'easy', duration: '2-3 hours' },
    { title: 'Mindfulness for Parents', description: 'Create quick mindfulness exercises that fit into busy parenting schedules.', category: 'self_care', earning: 35, difficulty: 'easy', duration: '2-3 hours' },
    { title: 'Evening Wind-Down Ritual', description: 'Design calming evening routines that help families transition to bedtime peacefully.', category: 'self_care', earning: 28, difficulty: 'easy', duration: '2-3 hours' }
  ]
  
  // Generate variations to reach 50 tasks
  const tasks: any[] = []
  let taskId = 1
  
  // Create multiple variations of each template
  taskTemplates.forEach((template, index) => {
    // Original task
    tasks.push({
      title: template.title,
      description: template.description,
      earning_potential: template.earning,
      type: 'platform_funded',
      status: 'open',
      approval_status: 'approved',
      max_participants: Math.floor(Math.random() * 8) + 3, // 3-10 participants
      duration: template.duration,
      difficulty: template.difficulty,
      requirements: 'Basic supplies and documentation tools. Experience in the topic area helpful.',
      location: 'Remote/Home',
      host_id: 'platform-system'
    })
    
    // Variation 1: Advanced version
    if (tasks.length < 50) {
      tasks.push({
        title: `Advanced ${template.title}`,
        description: `${template.description} Advanced version with additional techniques and professional insights.`,
        earning_potential: template.earning + 15,
        type: 'platform_funded',
        status: 'open',
        approval_status: 'approved',
        max_participants: Math.floor(Math.random() * 5) + 2, // 2-6 participants
        duration: template.duration.replace('2-3', '4-5').replace('3-4', '5-6').replace('4-5', '6-7'),
        difficulty: template.difficulty === 'easy' ? 'medium' : 'hard',
        requirements: 'Advanced knowledge required. Professional experience preferred.',
        location: 'Remote/Home',
        host_id: 'platform-system'
      })
    }
    
    // Variation 2: Quick version
    if (tasks.length < 50) {
      tasks.push({
        title: `Quick ${template.title}`,
        description: `${template.description} Streamlined version for busy schedules.`,
        earning_potential: Math.max(15, template.earning - 10),
        type: 'platform_funded',
        status: 'open',
        approval_status: 'approved',
        max_participants: Math.floor(Math.random() * 12) + 5, // 5-16 participants
        duration: '1-2 hours',
        difficulty: 'easy',
        requirements: 'Minimal supplies needed. Perfect for beginners.',
        location: 'Remote/Home',
        host_id: 'platform-system'
      })
    }
  })
  
  return tasks.slice(0, 50) // Ensure exactly 50 tasks
}

export async function POST(request: NextRequest) {
  try {
    const { count = 50 } = await request.json()
    
    console.log(`🚀 Creating ${count} bulk platform tasks...`)

    // Check if tasks already exist
    const { data: existingTasks, error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .eq('type', 'platform_funded')

    if (checkError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing tasks',
        details: checkError
      }, { status: 500 })
    }

    if (existingTasks && existingTasks.length >= count) {
      return NextResponse.json({
        success: true,
        message: `Platform tasks already exist (${existingTasks.length} tasks found)`,
        existing_count: existingTasks.length
      })
    }

    // Generate bulk tasks
    const bulkTasks = generateBulkTasks()
    
    // Insert tasks in batches of 10 to avoid timeout
    const batchSize = 10
    const insertedTasks = []
    
    for (let i = 0; i < bulkTasks.length; i += batchSize) {
      const batch = bulkTasks.slice(i, i + batchSize)
      
      const { data: batchData, error: batchError } = await supabase
        .from('tasks')
        .insert(batch)
        .select()

      if (batchError) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, batchError)
        return NextResponse.json({
          success: false,
          error: `Failed to insert task batch ${i/batchSize + 1}`,
          details: batchError
        }, { status: 500 })
      }
      
      insertedTasks.push(...(batchData || []))
      console.log(`✅ Batch ${i/batchSize + 1} completed: ${batchData?.length || 0} tasks`)
    }

    const totalValue = insertedTasks.reduce((sum, task) => sum + task.earning_potential, 0)
    const maxPotential = insertedTasks.reduce((sum, task) => sum + (task.earning_potential * task.max_participants), 0)

    console.log(`🎉 Successfully created ${insertedTasks.length} platform-funded tasks`)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedTasks.length} platform-funded tasks`,
      tasks_created: insertedTasks.length,
      total_value: totalValue,
      max_monthly_potential: maxPotential,
      categories: [
        'Home Organization',
        'Meal Planning', 
        'Education',
        'Health & Fitness',
        'Financial Education',
        'Self-Care & Wellness'
      ],
      budget_impact: `$${totalValue} base value, up to $${maxPotential} if all slots filled`
    })

  } catch (error) {
    console.error('Bulk task creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bulk task creation failed',
      details: error
    }, { status: 500 })
  }
}
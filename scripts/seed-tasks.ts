// Quick script to seed platform tasks using correct schema
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const platformTasks = [
  {
    title: 'Organize and Photograph Kids\' Artwork Portfolio',
    description: 'Create a digital portfolio of your child\'s artwork throughout the year. Sort, photograph, and create a beautiful memory book that other parents can learn from.',
    earningPotential: 35.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 10,
    duration: '2-3 hours',
    difficulty: 'easy',
    requirements: 'Phone/camera, storage folders, labeling supplies. Must have children\'s artwork to organize.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  },
  {
    title: 'Create Meal Prep System for Busy School Mornings',
    description: 'Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Include shopping lists, prep schedules, and kid-friendly options.',
    earningPotential: 42.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 8,
    duration: '4-5 hours',
    difficulty: 'medium',
    requirements: 'Meal containers, planning notebook, kitchen supplies. Experience with family meal planning.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  },
  {
    title: 'Design Budget-Friendly Birthday Party at Home',
    description: 'Plan and execute a memorable birthday party for under $50. Document decorations, activities, and timeline for other parents to replicate.',
    earningPotential: 38.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 12,
    duration: '3-4 hours',
    difficulty: 'medium',
    requirements: 'Basic party supplies, creativity, camera for documentation. Must execute actual party.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  },
  {
    title: 'Document Family Fitness Routine for Small Spaces',
    description: 'Create a comprehensive fitness program that families can do together in apartments or small homes. Include modifications for different ages.',
    earningPotential: 45.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 6,
    duration: '4-5 hours',
    difficulty: 'medium',
    requirements: 'Exercise equipment (optional), camera, measurement tools. Fitness knowledge helpful.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  },
  {
    title: 'Design Math Practice Games for Different Learning Styles',
    description: 'Create visual, auditory, and kinesthetic math games that make practice enjoyable. Focus on common problem areas for elementary students.',
    earningPotential: 52.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 5,
    duration: '6-7 hours',
    difficulty: 'medium',
    requirements: 'Craft supplies, math manipulatives, game boards. Education background preferred.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  },
  {
    title: 'Create After-School Snack Prep Guide',
    description: 'Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips for busy families.',
    earningPotential: 32.00,
    type: 'platform_funded',
    status: 'open',
    approvalStatus: 'approved',
    maxParticipants: 15,
    duration: '2-3 hours',
    difficulty: 'easy',
    requirements: 'Kitchen access, various healthy ingredients, containers. Nutrition knowledge helpful.',
    location: 'Remote/Home',
    hostId: 'platform-system'
  }
]

async function seedTasks() {
  try {
    console.log('🌱 Seeding platform tasks...')
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(platformTasks)
      .select()
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    console.log(`✅ Successfully seeded ${data?.length || 0} tasks`)
    console.log('Total value:', platformTasks.reduce((sum, task) => sum + task.earningPotential, 0))
    
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedTasks()
}

export { seedTasks, platformTasks }
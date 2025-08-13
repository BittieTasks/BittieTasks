// Create curated daily tasks for BittieTasks
const fetch = require('node-fetch');

const CURATED_TASKS = [
  {
    title: "Complete a Load of Laundry",
    description: "Wash, dry, and fold a complete load of laundry. Perfect for busy schedules - earn while doing necessary household tasks.",
    category: "Household",
    type: "peer_to_peer", 
    earningPotential: 15.00,
    duration: "2 hours",
    difficulty: "easy",
    location: "Your home",
    requirements: "Access to washer/dryer, detergent. Photo verification of clean folded clothes required."
  },
  {
    title: "Prepare a Healthy Home Meal", 
    description: "Cook a nutritious meal from scratch. Share your cooking journey and earn while nourishing yourself or your family.",
    category: "Household",
    type: "peer_to_peer",
    earningPotential: 20.00, 
    duration: "1.5 hours",
    difficulty: "medium",
    location: "Your kitchen",
    requirements: "Basic cooking ingredients and utensils. Photo of completed meal and cooking process required."
  },
  {
    title: "Complete a Self-Care Routine",
    description: "Dedicate time to your well-being: skincare, meditation, reading, or any personal care activity. Self-investment pays!",
    category: "Personal",
    type: "peer_to_peer",
    earningPotential: 12.00,
    duration: "30 minutes", 
    difficulty: "easy",
    location: "Anywhere comfortable",
    requirements: "Choose any self-care activity. Photo or brief description of your routine required."
  },
  {
    title: "Complete Kitchen Cleanup",
    description: "Wash dishes, wipe counters, and organize the kitchen. Turn this daily chore into earning opportunity.", 
    category: "Household",
    type: "peer_to_peer",
    earningPotential: 10.00,
    duration: "45 minutes",
    difficulty: "easy",
    location: "Your kitchen",
    requirements: "Dish soap and cleaning supplies. Before/after photos of clean kitchen required."
  },
  {
    title: "Help a Neighbor with Daily Task",
    description: "Assist someone in your community with grocery shopping, dog walking, or simple errands. Build connections while earning.",
    category: "Community", 
    type: "peer_to_peer",
    earningPotential: 25.00,
    duration: "1-2 hours",
    difficulty: "easy",
    location: "Local neighborhood",
    requirements: "Reliable transportation. Photo verification of completed assistance and brief description required."
  },
  {
    title: "Organize and Declutter a Room",
    description: "Transform any space - bedroom, closet, or living area. Create order in your environment while earning for productivity.",
    category: "Household",
    type: "peer_to_peer", 
    earningPotential: 18.00,
    duration: "2 hours",
    difficulty: "medium",
    location: "Your home",
    requirements: "Storage containers helpful but not required. Before/after photos showing transformation required."
  },
  {
    title: "Complete a Daily Movement Activity", 
    description: "Any physical activity: walking, yoga, stretching, dancing, or workout. Celebrate movement and earn for staying active.",
    category: "Health",
    type: "peer_to_peer",
    earningPotential: 14.00,
    duration: "30-60 minutes",
    difficulty: "easy",
    location: "Home, gym, or outdoors",
    requirements: "Any form of movement welcome. Photo or video showing activity completion required."
  },
  {
    title: "Complete a Group Daily Challenge",
    description: "Join others in completing the same daily task - cooking, cleaning, or self-care. Shared motivation, individual rewards.",
    category: "Community",
    type: "shared", 
    earningPotential: 16.00,
    maxParticipants: 10,
    duration: "1 hour",
    difficulty: "medium",
    location: "Anywhere",
    requirements: "Join the daily group challenge. Share progress photos and encourage others in the task community."
  }
];

console.log('BittieTasks: Creating 8 curated daily tasks...');
console.log('These tasks focus on inclusive daily activities that work well for peer-to-peer payments.\n');

CURATED_TASKS.forEach((task, index) => {
  console.log(`${index + 1}. ${task.title}`);
  console.log(`   💰 $${task.earningPotential} | ⏱️ ${task.duration} | 📍 ${task.location}`);
  console.log(`   ${task.description}`);
  console.log('');
});

console.log('✅ All tasks focus on:');
console.log('• Daily household activities (laundry, cooking, cleaning)');
console.log('• Self-care and wellness activities');  
console.log('• Community support and connection');
console.log('• Inclusive to all adults (no childcare)');
console.log('• Peer-to-peer payment model');
console.log('• Photo/video verification for automatic payments');
console.log('\n💡 These tasks turn daily routines into earning opportunities!');
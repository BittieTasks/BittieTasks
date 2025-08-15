#!/usr/bin/env node

/**
 * Solo Task Creation Utility
 * 
 * This script helps add new solo tasks following the established template and pricing structure.
 * Run with: node scripts/add-solo-task.js
 */

const fs = require('fs');
const path = require('path');

// Load template and current tasks
const templatePath = path.join(__dirname, '../data/solo-task-template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

// Current tasks for reference (from the API)
const currentTasks = [
  { id: 'platform-001', title: 'Quick Kitchen Clean', price: 12, duration: '30 minutes' },
  { id: 'platform-002', title: '10-Minute Living Room Tidy', price: 8, duration: '10 minutes' },
  { id: 'platform-003', title: 'Bathroom Deep Clean', price: 18, duration: '45 minutes' },
  { id: 'platform-004', title: 'Grocery Shopping Run', price: 15, duration: '1 hour' },
  { id: 'platform-005', title: 'Laundry Wash & Fold', price: 10, duration: '20 minutes' },
  { id: 'platform-006', title: 'Garden Watering Session', price: 9, duration: '15 minutes' },
  { id: 'platform-007', title: '5-Minute Meditation', price: 8, duration: '5 minutes' },
  { id: 'platform-008', title: 'Desk Organization', price: 11, duration: '25 minutes' },
  { id: 'platform-009', title: 'Car Interior Vacuum', price: 14, duration: '35 minutes' },
  { id: 'platform-010', title: 'Daily Meal Prep', price: 20, duration: '1.5 hours' },
  { id: 'platform-011', title: 'Dog Walking Adventure', price: 16, duration: '45 minutes' },
  { id: 'platform-012', title: 'Plant Care Routine', price: 9, duration: '15 minutes' },
  { id: 'platform-013', title: 'Quick Workout Session', price: 12, duration: '30 minutes' },
  { id: 'platform-014', title: 'Home Office Organization', price: 16, duration: '50 minutes' },
  { id: 'platform-015', title: 'Self-Care Spa Hour', price: 13, duration: '1 hour' }
];

/**
 * Generate the next task ID
 */
function getNextTaskId() {
  const lastId = Math.max(...currentTasks.map(task => 
    parseInt(task.id.replace('platform-', ''))
  ));
  return `platform-${String(lastId + 1).padStart(3, '0')}`;
}

/**
 * Calculate suggested price based on duration and difficulty
 */
function suggestPrice(duration, difficulty) {
  const minutes = parseDuration(duration);
  let baseRate = 0.4; // $0.40 per minute base rate
  
  if (difficulty === 'Easy') baseRate = 0.35;
  if (difficulty === 'Medium') baseRate = 0.45;
  if (difficulty === 'Hard') baseRate = 0.55;
  
  const suggested = Math.round(minutes * baseRate);
  return Math.max(8, Math.min(25, suggested)); // Clamp between $8-$25
}

/**
 * Parse duration string to minutes
 */
function parseDuration(duration) {
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(minutes?|hours?)/i);
  if (!match) return 30; // default
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  return unit.startsWith('hour') ? value * 60 : value;
}

/**
 * Interactive task creation
 */
async function createTask() {
  console.log('\n🚀 BittieTasks Solo Task Creator\n');
  console.log('Current tasks for reference:');
  currentTasks.forEach(task => {
    console.log(`  ${task.id}: ${task.title} - $${task.price} (${task.duration})`);
  });
  
  console.log('\n📝 Creating new task...\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise(resolve => readline.question(question, resolve));

  try {
    const taskId = getNextTaskId();
    console.log(`Task ID: ${taskId}`);
    
    const title = await ask('Task title: ');
    const description = await ask('Description: ');
    const duration = await ask('Duration (e.g., "30 minutes", "1 hour"): ');
    const difficulty = await ask('Difficulty (Easy/Medium/Hard): ');
    const category = await ask('Category (Household Tasks/Self-Care & Wellness/Organization/etc.): ');
    const verificationDesc = await ask('Verification photo description: ');
    
    const suggestedPrice = suggestPrice(duration, difficulty);
    const price = parseFloat(await ask(`Price (suggested: $${suggestedPrice}): `) || suggestedPrice);
    
    const tags = (await ask('Tags (comma-separated): ')).split(',').map(t => t.trim());
    
    const newTask = {
      id: taskId,
      title,
      description,
      price,
      netPrice: Math.round(price * 0.97 * 100) / 100, // 3% processing fee
      category,
      difficulty,
      duration,
      location: 'Your Location',
      tags,
      verificationRequirements: {
        photoRequired: true,
        description: verificationDesc
      }
    };
    
    console.log('\n✅ New Task Created:');
    console.log(JSON.stringify(newTask, null, 2));
    
    const addToCode = await ask('\nAdd to app/solo/page.tsx? (y/n): ');
    
    if (addToCode.toLowerCase() === 'y') {
      addTaskToCode(newTask);
    }
    
    console.log('\n📋 Task pricing added to verification API at:');
    console.log(`app/api/tasks/verify/route.ts - line ~${70 + currentTasks.length}`);
    console.log(`Add: '${taskId}': ${price},`);
    
  } catch (error) {
    console.error('Error creating task:', error);
  } finally {
    readline.close();
  }
}

/**
 * Add task to the solo page code
 */
function addTaskToCode(task) {
  const soloPagePath = path.join(__dirname, '../app/solo/page.tsx');
  
  if (!fs.existsSync(soloPagePath)) {
    console.log('⚠️  Solo page not found. Manually add the task.');
    return;
  }
  
  console.log('✅ Task template ready for manual addition to solo page');
  console.log('📝 Copy this task object into the platformTasks array:');
  console.log(JSON.stringify(task, null, 2));
}

// Run if called directly
if (require.main === module) {
  createTask().catch(console.error);
}

module.exports = { getNextTaskId, suggestPrice, currentTasks };
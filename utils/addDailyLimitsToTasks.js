// Utility script to add daily limits to all everyday tasks
// Run this once to update the everydayTasks.ts file

const fs = require('fs')
const path = require('path')

const taskFile = path.join(__dirname, '../lib/everydayTasks.ts')
let content = fs.readFileSync(taskFile, 'utf8')

// Add daily limits to any task that doesn't have them
content = content.replace(
  /materials_needed: \[([^\]]+)\](?!\s*,\s*daily_limit)/g,
  `materials_needed: [$1],
    daily_limit: 5,
    completion_time_hours: 24,
    daily_completed: 0`
)

// Also handle tasks without materials_needed
content = content.replace(
  /location_type: '(home|local|online)'(?!\s*,\s*(materials_needed|daily_limit))/g,
  `location_type: '$1',
    daily_limit: 5,
    completion_time_hours: 24,
    daily_completed: 0`
)

fs.writeFileSync(taskFile, content)
console.log('Added daily limits to all everyday tasks!')
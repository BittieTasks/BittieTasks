# Solo Task Management Guide

This guide explains how to add, modify, and maintain solo tasks in the BittieTasks platform.

## Current Solo Task Structure

### Task ID Format
- Format: `platform-XXX` (e.g., `platform-001`, `platform-016`)
- Sequential numbering starting from 001
- Next available ID: `platform-016`

### Pricing Structure
- **Range**: $8 - $25 per task
- **Fee**: 3% processing fee (user receives 97% of gross amount)
- **Calculation**: Net payout = Gross amount × 0.97

### Current Tasks (platform-001 to platform-015)
1. **platform-001**: Quick Kitchen Clean - $12 (30 min)
2. **platform-002**: 10-Minute Living Room Tidy - $8 (10 min)
3. **platform-003**: Bathroom Deep Clean - $18 (45 min)
4. **platform-004**: Grocery Shopping Run - $15 (1 hour)
5. **platform-005**: Laundry Wash & Fold - $10 (20 min)
6. **platform-006**: Garden Watering Session - $9 (15 min)
7. **platform-007**: 5-Minute Meditation - $8 (5 min)
8. **platform-008**: Desk Organization - $11 (25 min)
9. **platform-009**: Car Interior Vacuum - $14 (35 min)
10. **platform-010**: Daily Meal Prep - $20 (1.5 hours)
11. **platform-011**: Dog Walking Adventure - $16 (45 min)
12. **platform-012**: Plant Care Routine - $9 (15 min)
13. **platform-013**: Quick Workout Session - $12 (30 min)
14. **platform-014**: Home Office Organization - $16 (50 min)
15. **platform-015**: Self-Care Spa Hour - $13 (1 hour)

## Adding New Solo Tasks

### Method 1: Using the Task Creator Script
```bash
node scripts/add-solo-task.js
```

This interactive script will:
- Generate the next task ID automatically
- Suggest pricing based on duration and difficulty
- Create the task object with all required fields
- Provide code snippets for manual addition

### Method 2: Manual Creation

1. **Choose Task ID**: Use next sequential number (platform-016, platform-017, etc.)

2. **Follow Template** (from `data/solo-task-template.json`):
```json
{
  "id": "platform-XXX",
  "title": "Clear, actionable task title",
  "description": "Detailed description with specific requirements",
  "price": 0,
  "category": "Household Tasks", // or other category
  "difficulty": "Easy|Medium|Hard",
  "duration": "X minutes|X hours",
  "location": "Your Location",
  "tags": ["relevant", "tags"],
  "verificationRequirements": {
    "photoRequired": true,
    "description": "Specific photo requirements"
  }
}
```

3. **Add to Code Files**:

   **a) Solo Page Display** (`app/solo/page.tsx`):
   Add to the `platformTasks` array around line 150.

   **b) Pricing API** (`app/api/tasks/verify/route.ts`):
   Add to the `taskPricing` object around line 60:
   ```javascript
   'platform-XXX': price,
   ```

## Pricing Guidelines

### Base Rates by Duration
- **5-15 minutes**: $8-10
- **15-30 minutes**: $10-12
- **30-45 minutes**: $12-16
- **45-60 minutes**: $16-20
- **1+ hours**: $20-25

### Difficulty Multipliers
- **Easy**: -$1 to -$2 from base
- **Medium**: Standard rate
- **Hard**: +$2 to +$4 above base

### Examples
- Quick tidy (Easy, 10 min): $8
- Deep clean (Hard, 45 min): $18
- Meal prep (Medium, 90 min): $20

## Categories
- Household Tasks
- Self-Care & Wellness
- Organization
- Cleaning
- Cooking
- Technology
- Exercise & Fitness
- Pet Care
- Garden & Plants

## Verification Requirements
- **Always require photo**: All solo tasks must have photo verification
- **Clear completion evidence**: Task completion should be visually obvious
- **AI-friendly**: Design tasks that AI can verify from photos

## File Locations
- **Template**: `data/solo-task-template.json`
- **Creator Script**: `scripts/add-solo-task.js`
- **Solo Page**: `app/solo/page.tsx`
- **Verification API**: `app/api/tasks/verify/route.ts`
- **This Guide**: `docs/SOLO_TASK_MANAGEMENT.md`

## Best Practices
1. **Consistent Pricing**: Follow the established rate structure
2. **Clear Instructions**: Make tasks easy to understand and complete
3. **Fair Market Value**: Price tasks competitively but fairly
4. **Verification Friendly**: Ensure completion can be verified via photo
5. **User Experience**: Keep tasks achievable and rewarding

## Testing New Tasks
1. Add task to code
2. Test on solo page display
3. Verify pricing calculation (97% net payout)
4. Test verification flow
5. Confirm payment processing

---

*Last Updated: Current as of platform-015 (Self-Care Spa Hour)*
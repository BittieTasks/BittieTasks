# Task Time Limit Implementation Proposal

## Problem Statement:
Users can apply to tasks and never complete them, which:
- Blocks other users from earning opportunities
- Reduces platform revenue velocity  
- Creates poor user experience with "stale" applications

## Proposed Solution: 24-Hour Completion Window for Solo Tasks

### User Flow:
1. **Apply to Task** → Clock starts ticking
2. **20 hours later** → Reminder notification: "4 hours left to complete!"
3. **24 hours later** → Auto-forfeit + Task reopens for others
4. **Option**: Request 12-hour extension (once per task)

### Dashboard Integration:
- **Pending tasks show countdown**: "Complete within 18 hours"
- **Color coding**: Green (>12h), Yellow (6-12h), Red (<6h) 
- **Urgency messaging**: "Complete soon or task will reopen to others"

### Implementation Details:

#### Database Schema Addition:
```sql
ALTER TABLE task_participants ADD COLUMN deadline TIMESTAMP;
ALTER TABLE task_participants ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE task_participants ADD COLUMN deadline_extended BOOLEAN DEFAULT false;
```

#### Automatic Deadline Setting:
- On application: `deadline = joinedAt + 24 hours`
- Extension request: `deadline = deadline + 12 hours` (if not already extended)

#### Background Job (Simple Polling):
```javascript
// Check every hour for expired applications
setInterval(async () => {
  // Send reminders (4 hours before deadline)
  // Auto-forfeit expired applications
  // Reopen tasks for new applicants
}, 60 * 60 * 1000) // 1 hour
```

### Benefits:
✅ **Creates healthy urgency** without being unreasonable
✅ **Prevents task hoarding** - users can't apply to 10 tasks and sit on them  
✅ **Increases completion rates** through urgency psychology
✅ **Fair to community** - gives everyone equal opportunity
✅ **Revenue velocity** - faster completion = faster payment cycles

### Risk Mitigation:
- **24 hours is generous** for household tasks (laundry, cleaning)
- **Extension available** for genuine emergencies  
- **Clear communication** - users know the rules upfront
- **Start with solo tasks** - lower risk than community coordination

## Recommendation:
**YES - Implement 24-hour completion window for solo tasks**

This creates the right balance of urgency and fairness while being technically straightforward to implement.
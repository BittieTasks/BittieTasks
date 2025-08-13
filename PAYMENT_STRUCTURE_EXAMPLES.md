# BittieTasks Payment Structure Examples

## Two Payment Models Working Together

### 1. Peer-to-Peer Tasks (7% Platform Fee)
Users pay other users directly, BittieTasks takes 7% commission.

**Examples:**
- **Help Neighbor with Groceries** - $25.00
  - User A posts: "Need someone to pick up groceries" 
  - User B completes task and submits verification photo
  - User A pays $25.00 → User B receives $23.25 (BittieTasks keeps $1.75)

- **Organize My Home Office** - $18.00
  - User requests help organizing their space
  - Helper completes task with before/after photos
  - Requester pays $18.00 → Helper receives $16.74 (BittieTasks keeps $1.26)

### 2. BittieTasks Platform Payments (0% Fee)
BittieTasks pays users directly to encourage platform adoption and activity.

**Examples:**
- **Complete Your Daily Laundry** - $15.00
  - BittieTasks sponsors this daily task
  - User completes laundry, submits verification photo
  - BittieTasks pays user $15.00 directly (no fees)

- **Cook a Healthy Meal at Home** - $20.00
  - Platform-funded to promote healthy habits
  - User cooks meal, shares completion photo
  - BittieTasks pays user $20.00 directly (no fees)

## Task Type Implementation

```javascript
// Task creation with payment type
{
  title: "Help with Kitchen Cleanup",
  payment_type: "peer_to_peer", // or "platform_funded"
  earning_potential: 10.00,
  fee_percentage: 0.07, // 7% for peer-to-peer, 0% for platform
  funded_by: "user_request" // or "bittietasks_platform"
}
```

## Revenue Streams Summary

1. **Peer-to-Peer (7% fees)**: Users pay users, BittieTasks earns commission
2. **Platform-Funded (0% fees)**: BittieTasks pays users for engagement/acquisition  
3. **Corporate Partnerships (15% fees)**: Businesses sponsor tasks through BittieTasks

## Example Daily Task Mix

**Morning Tasks (Platform-Funded):**
- Complete laundry routine - $15 (BittieTasks pays)
- Prepare healthy breakfast - $12 (BittieTasks pays)

**Afternoon Tasks (Peer-to-Peer):**
- Help neighbor with errands - $25 (User pays user, 7% fee)
- Organize someone's closet - $18 (User pays user, 7% fee)

**Evening Tasks (Mixed):**
- Group fitness challenge - $16 (Platform-funded)
- Kitchen cleanup service - $10 (Peer-to-peer)

This dual payment model creates multiple revenue opportunities while encouraging both community interaction (peer-to-peer) and platform engagement (BittieTasks-funded tasks).
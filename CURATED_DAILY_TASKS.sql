-- BittieTasks: Curated Daily Task List
-- Deactivate all current tasks and create 8 inclusive daily tasks
-- Focus: Daily activities, self-care, community support, peer-to-peer

-- First, deactivate all existing tasks
UPDATE tasks SET status = 'cancelled', updatedAt = NOW();

-- Create 8 curated daily tasks that are inclusive and practical

-- 1. HOUSEHOLD TASKS
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-laundry-01', 
  'Complete a Load of Laundry', 
  'Wash, dry, and fold a complete load of laundry. Perfect for busy schedules - earn while doing necessary household tasks.',
  (SELECT id FROM categories WHERE name = 'Household' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  15.00,
  1,
  '2 hours',
  'Your home',
  'easy',
  'Access to washer/dryer, detergent. Photo verification of clean folded clothes required.',
  NOW(),
  NOW()
);

-- 2. COOKING & MEAL PREP
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-cooking-01',
  'Prepare a Healthy Home Meal',
  'Cook a nutritious meal from scratch. Share your cooking journey and earn while nourishing yourself or your family.',
  (SELECT id FROM categories WHERE name = 'Household' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  20.00,
  1,
  '1.5 hours',
  'Your kitchen',
  'medium',
  'Basic cooking ingredients and utensils. Photo of completed meal and cooking process required.',
  NOW(),
  NOW()
);

-- 3. SELF-CARE ACTIVITIES
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-selfcare-01',
  'Complete a Self-Care Routine',
  'Dedicate time to your well-being: skincare, meditation, reading, or any personal care activity. Self-investment pays!',
  (SELECT id FROM categories WHERE name = 'Personal' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  12.00,
  1,
  '30 minutes',
  'Anywhere comfortable',
  'easy',
  'Choose any self-care activity. Photo or brief description of your routine required.',
  NOW(),
  NOW()
);

-- 4. DISHES & KITCHEN CLEANUP  
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-dishes-01',
  'Complete Kitchen Cleanup',
  'Wash dishes, wipe counters, and organize the kitchen. Turn this daily chore into earning opportunity.',
  (SELECT id FROM categories WHERE name = 'Household' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  10.00,
  1,
  '45 minutes',
  'Your kitchen',
  'easy',
  'Dish soap and cleaning supplies. Before/after photos of clean kitchen required.',
  NOW(),
  NOW()
);

-- 5. COMMUNITY SUPPORT
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-community-01',
  'Help a Neighbor with Daily Task',
  'Assist someone in your community with grocery shopping, dog walking, or simple errands. Build connections while earning.',
  (SELECT id FROM categories WHERE name = 'Community' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  25.00,
  1,
  '1-2 hours',
  'Local neighborhood',
  'easy',
  'Reliable transportation. Photo verification of completed assistance and brief description required.',
  NOW(),
  NOW()
);

-- 6. ORGANIZATION & DECLUTTER
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-organize-01',
  'Organize and Declutter a Room',
  'Transform any space - bedroom, closet, or living area. Create order in your environment while earning for productivity.',
  (SELECT id FROM categories WHERE name = 'Household' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  18.00,
  1,
  '2 hours',
  'Your home',
  'medium',
  'Storage containers helpful but not required. Before/after photos showing transformation required.',
  NOW(),
  NOW()
);

-- 7. FITNESS & MOVEMENT
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-fitness-01',
  'Complete a Daily Movement Activity',
  'Any physical activity: walking, yoga, stretching, dancing, or workout. Celebrate movement and earn for staying active.',
  (SELECT id FROM categories WHERE name = 'Health' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'peer_to_peer',
  'active',
  'approved',
  14.00,
  1,
  '30-60 minutes',
  'Home, gym, or outdoors',
  'easy',
  'Any form of movement welcome. Photo or video showing activity completion required.',
  NOW(),
  NOW()
);

-- 8. SHARED ACCOMPLISHMENT
INSERT INTO tasks (
  id, title, description, categoryId, hostId, type, status, approvalStatus,
  earningPotential, maxParticipants, duration, location, difficulty, requirements,
  createdAt, updatedAt
) VALUES (
  'task-shared-01',
  'Complete a Group Daily Challenge',
  'Join others in completing the same daily task - cooking, cleaning, or self-care. Shared motivation, individual rewards.',
  (SELECT id FROM categories WHERE name = 'Community' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  'shared',
  'active',
  'approved',
  16.00,
  10,
  '1 hour',
  'Anywhere',
  'medium',
  'Join the daily group challenge. Share progress photos and encourage others in the task community.',
  NOW(),
  NOW()
);

-- Create verification requirements for these tasks
INSERT INTO task_verification_requirements (
  id, taskId, revenueStream, requiredMethods, photoRequirements, autoApprovalCriteria, createdAt
) 
SELECT 
  'verify-' || t.id,
  t.id,
  'peer_to_peer'::revenue_stream,
  ARRAY['photo']::varchar[],
  '{"count": 2, "requiresLocation": false, "requiresTimestamp": true}'::jsonb,
  '{"minPhotos": 2, "autoApproveScore": 85}'::jsonb,
  NOW()
FROM tasks t 
WHERE t.status = 'active' AND t.id LIKE 'task-%';
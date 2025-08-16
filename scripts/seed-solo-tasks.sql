-- Insert live platform-funded solo tasks for production use

-- Clear existing platform tasks
DELETE FROM tasks WHERE type = 'solo' AND "creatorId" = 'platform';

-- Insert real solo tasks for production
INSERT INTO tasks (
  id, title, description, "earningPotential", location, duration, difficulty, 
  requirements, "maxParticipants", type, status, "approvalStatus", 
  "creatorId", "reviewTier", "createdAt"
) VALUES 
(
  'platform-001',
  'Laundry Day',
  'Complete a full load of laundry from start to finish: wash, dry, fold, and put away. Take photos showing your clean, folded, and organized clothes.',
  '20.00',
  'Your Home',
  '2 hours',
  'easy',
  'Access to washer/dryer, Photo verification',
  2,
  'solo',
  'open',
  'approved',
  'platform',
  'auto_approved',
  NOW()
),
(
  'platform-002', 
  'Kitchen Clean-Up',
  'Wash all dishes and clean kitchen counters thoroughly. Take before/after photos showing your sparkling clean kitchen transformation.',
  '15.00',
  'Your Home',
  '30 minutes',
  'easy',
  'Kitchen access, Before/after photos',
  2,
  'solo',
  'open', 
  'approved',
  'platform',
  'auto_approved',
  NOW()
),
(
  'platform-003',
  'Pilates Session', 
  'Complete a 30-minute pilates workout session. Share a photo or video of you doing pilates poses and your post-workout state.',
  '12.00',
  'Your Home or Studio',
  '30 minutes',
  'easy',
  'Exercise mat, Workout verification photo/video',
  2,
  'solo',
  'open',
  'approved', 
  'platform',
  'auto_approved',
  NOW()
),
(
  'platform-004',
  'Grocery Run',
  'Pick up essential groceries for the week from your local store. Share a photo of your grocery haul or receipt as verification.',
  '25.00',
  'Local Grocery Store', 
  '1 hour',
  'easy',
  'Transportation to store, Receipt or grocery photo',
  2,
  'solo',
  'open',
  'approved',
  'platform', 
  'auto_approved',
  NOW()
),
(
  'platform-005',
  'Room Organization',
  'Organize and tidy one room in your home completely. Take before and after photos showing the amazing transformation.',
  '30.00',
  'Your Home',
  '1 hour', 
  'easy',
  'Before/after photos, Room access',
  2,
  'solo',
  'open',
  'approved',
  'platform',
  'auto_approved', 
  NOW()
);
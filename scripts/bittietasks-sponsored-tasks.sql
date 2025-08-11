-- BittieTasks Sponsored Tasks
-- These are tasks that BittieTasks pays users to complete
-- Run this after the main database setup

-- Create BittieTasks system profile
INSERT INTO profiles (id, first_name, last_name, email, subscription_tier) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'BittieTasks',
  'Platform',
  'platform@bittietasks.com',
  'premium'
) ON CONFLICT (id) DO NOTHING;

-- Insert BittieTasks sponsored tasks
INSERT INTO tasks (
  id, title, description, category_id, creator_id, payout, location, 
  time_commitment, max_participants, deadline, task_type, status, 
  is_sponsored, sponsor_name, requirements
) VALUES 

-- School & Education Tasks
(
  'bt-001', 
  'Share Your Best Parenting Tip', 
  'Help other parents by sharing one practical parenting tip that has worked well for your family. We''ll pay you $15 for your wisdom!', 
  1, 
  '00000000-0000-0000-0000-000000000001', 
  15.00, 
  'Online - Share via Platform', 
  '10 minutes', 
  50, 
  NOW() + INTERVAL '30 days', 
  'sponsored', 
  'open', 
  true, 
  'BittieTasks Platform', 
  ARRAY['Must be a parent or guardian', 'Tip should be practical and specific']
),

-- Meal Planning Tasks  
(
  'bt-002',
  'Review a Family-Friendly Recipe',
  'Try a new family recipe and write a honest review. Share what your kids thought and any modifications you made. Earn $20 for helping other families!',
  2,
  '00000000-0000-0000-0000-000000000001',
  20.00,
  'Your Kitchen',
  '1 hour',
  25,
  NOW() + INTERVAL '21 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Must prepare and taste the recipe', 'Include photo of finished dish', 'Write 100+ word review']
),

-- Shopping & Errands Tasks
(
  'bt-003',
  'Compare Grocery Prices for Families',
  'Visit 2 local grocery stores and compare prices on 10 common family items (milk, bread, bananas, etc.). Help families save money and earn $25!',
  3,
  '00000000-0000-0000-0000-000000000001',
  25.00,
  'Your Local Area',
  '2 hours',
  20,
  NOW() + INTERVAL '14 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Visit at least 2 different stores', 'Price 10 specific family items', 'Take photos of price displays']
),

-- Transportation Tasks
(
  'bt-004',
  'Rate Your School Carpool Experience',
  'Share your experience with school carpooling - what works, what doesn''t, and tips for other parents. Get paid $18 for your insights!',
  4,
  '00000000-0000-0000-0000-000000000001',
  18.00,
  'Online - Share via Platform',
  '20 minutes',
  30,
  NOW() + INTERVAL '28 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Must have carpool experience', 'Share specific tips and challenges']
),

-- Childcare Support Tasks
(
  'bt-005',
  'Create a Kids Activity Guide',
  'Design a simple activity guide for parents with kids ages 3-8. Include 5 indoor activities with materials needed. Earn $30 for helping families!',
  5,
  '00000000-0000-0000-0000-000000000001',
  30.00,
  'Home Project',
  '90 minutes',
  15,
  NOW() + INTERVAL '21 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Must be parent of young children', 'Include 5 detailed activities', 'List all materials needed']
),

-- Home & Garden Tasks
(
  'bt-006',
  'Share Your Family Organization Hack',
  'Show us your best home organization tip that helps manage family life. Before/after photos required. Earn $22 for helping other families!',
  6,
  '00000000-0000-0000-0000-000000000001',
  22.00,
  'Your Home',
  '30 minutes',
  35,
  NOW() + INTERVAL '25 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Include before and after photos', 'Explain the system clearly', 'Must be family-focused']
),

-- Health & Wellness Tasks
(
  'bt-007',
  'Document Your Family Fitness Journey',
  'Share how you keep your family active together. Include photos and tips for other parents trying to stay healthy. Get paid $28!',
  7,
  '00000000-0000-0000-0000-000000000001',
  28.00,
  'Various Locations',
  '45 minutes',
  20,
  NOW() + INTERVAL '30 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Include family-friendly activities', 'Share specific tips', 'Include photos of activities']
),

-- Social Events Tasks
(
  'bt-008',
  'Plan a Budget-Friendly Kids Party',
  'Create a complete party plan for kids under $50. Include decorations, activities, and food ideas. Help other parents and earn $35!',
  8,
  '00000000-0000-0000-0000-000000000001',
  35.00,
  'Planning from Home',
  '2 hours',
  12,
  NOW() + INTERVAL '20 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Stay under $50 total budget', 'Include detailed breakdown', 'Provide shopping list', 'Include activity timeline']
),

-- Additional High-Value Tasks
(
  'bt-009',
  'Test and Review 3 Educational Apps',
  'Download and test 3 educational apps with your children (ages 4-12). Write honest reviews about learning value and engagement. Earn $40!',
  1,
  '00000000-0000-0000-0000-000000000001',
  40.00,
  'Home with Kids',
  '3 hours over 1 week',
  15,
  NOW() + INTERVAL '14 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Must have children ages 4-12', 'Test each app for minimum 2 days', 'Write detailed review for each app']
),

(
  'bt-010',
  'Create Weekly Meal Prep Guide',
  'Design a practical weekly meal prep guide for busy families. Include recipes, prep timeline, and shopping list. Get paid $45!',
  2,
  '00000000-0000-0000-0000-000000000001',
  45.00,
  'Your Kitchen',
  '4 hours',
  10,
  NOW() + INTERVAL '28 days',
  'sponsored',
  'open',
  true,
  'BittieTasks Platform',
  ARRAY['Must include 7 family meals', 'Provide detailed prep timeline', 'Include complete shopping list', 'Test the system yourself']
);

-- Update participant counts to 0 for sponsored tasks
UPDATE tasks SET current_participants = 0 WHERE creator_id = '00000000-0000-0000-0000-000000000001';
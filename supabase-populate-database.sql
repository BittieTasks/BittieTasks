-- BittieTasks Database Population Script
-- Run this in your Supabase SQL Editor to populate your database with sample data

-- First, let's ensure we can insert data (temporarily disable RLS if needed for setup)
-- Note: You can re-enable RLS after population if desired

-- Insert Task Categories
INSERT INTO public.task_categories (id, name, description, icon, color) VALUES
  (gen_random_uuid(), 'Cooking', 'Food preparation and cooking tasks', 'fa-utensils', '#ef4444'),
  (gen_random_uuid(), 'Cleaning', 'Home and office cleaning tasks', 'fa-broom', '#10b981'),
  (gen_random_uuid(), 'Childcare', 'Child supervision and care', 'fa-baby', '#f59e0b'),
  (gen_random_uuid(), 'Exercise', 'Fitness and physical activity', 'fa-dumbbell', '#8b5cf6'),
  (gen_random_uuid(), 'Errands', 'Shopping and errand running', 'fa-car', '#06b6d4'),
  (gen_random_uuid(), 'Self Care', 'Personal wellness and self-care', 'fa-heart', '#ec4899')
ON CONFLICT DO NOTHING;

-- Insert Sample Tasks
-- Note: We need to get category IDs first, so we'll use subqueries

-- Cooking Tasks
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty, 
  task_type, is_active, payment_type, allow_accountability_partners, max_partners, 
  partner_payment, flexible_barter
) VALUES
  (
    gen_random_uuid(),
    'Prep Family Breakfast', 
    'Help prep healthy breakfast for 4 people. Tasks include chopping fruit, making oatmeal, and setting table.',
    (SELECT id FROM public.task_categories WHERE name = 'Cooking' LIMIT 1),
    15.00, 45, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  ),
  (
    gen_random_uuid(),
    'Sunday Meal Prep',
    'Prepare 5 healthy lunches for the week. Includes shopping, cooking, and portioning meals.',
    (SELECT id FROM public.task_categories WHERE name = 'Cooking' LIMIT 1),
    35.00, 120, 'Medium', 'shared', true, 'cash', false, 3, 0.00, false
  );

-- Cleaning Tasks  
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty,
  task_type, is_active, payment_type, allow_accountability_partners, max_partners,
  partner_payment, flexible_barter
) VALUES
  (
    gen_random_uuid(),
    'Quick Home Tidy',
    'Help tidy living room, kitchen, and one bathroom. Light cleaning and organizing.',
    (SELECT id FROM public.task_categories WHERE name = 'Cleaning' LIMIT 1),
    20.00, 60, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  ),
  (
    gen_random_uuid(),
    'Deep Kitchen Clean',
    'Deep clean kitchen including appliances, counters, floors, and organizing pantry.',
    (SELECT id FROM public.task_categories WHERE name = 'Cleaning' LIMIT 1),
    45.00, 150, 'Hard', 'shared', true, 'cash', false, 3, 0.00, false
  );

-- Childcare Tasks
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty,
  task_type, is_active, payment_type, allow_accountability_partners, max_partners,
  partner_payment, flexible_barter  
) VALUES
  (
    gen_random_uuid(),
    'After School Supervision',
    'Pick up kids from school, help with homework, and supervise until parent returns.',
    (SELECT id FROM public.task_categories WHERE name = 'Childcare' LIMIT 1),
    25.00, 180, 'Medium', 'shared', true, 'cash', false, 3, 0.00, false
  ),
  (
    gen_random_uuid(),
    'Weekend Playdate Host',
    'Host and supervise 4-6 kids for a fun playdate with games and snacks.',
    (SELECT id FROM public.task_categories WHERE name = 'Childcare' LIMIT 1),
    40.00, 240, 'Medium', 'shared', true, 'cash', false, 3, 0.00, false
  );

-- Exercise Tasks
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty,
  task_type, is_active, payment_type, allow_accountability_partners, max_partners,
  partner_payment, flexible_barter
) VALUES
  (
    gen_random_uuid(),
    'Morning Walk Group',
    'Join or lead a 30-minute neighborhood walk. Great for meeting neighbors and staying active!',
    (SELECT id FROM public.task_categories WHERE name = 'Exercise' LIMIT 1),
    8.00, 30, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  ),
  (
    gen_random_uuid(),
    'Family Yoga Session',
    'Lead a relaxing family yoga session in the park. All skill levels welcome.',
    (SELECT id FROM public.task_categories WHERE name = 'Exercise' LIMIT 1),
    18.00, 60, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  );

-- Errands Tasks
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty,
  task_type, is_active, payment_type, allow_accountability_partners, max_partners,
  partner_payment, flexible_barter
) VALUES
  (
    gen_random_uuid(),
    'Grocery Run Helper',
    'Help with weekly grocery shopping - driving, carrying bags, organizing at home.',
    (SELECT id FROM public.task_categories WHERE name = 'Errands' LIMIT 1),
    22.00, 90, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  ),
  (
    gen_random_uuid(),
    'School Supply Shopping',
    'Help shop for back-to-school supplies for 2 kids. List provided.',
    (SELECT id FROM public.task_categories WHERE name = 'Errands' LIMIT 1),
    28.00, 75, 'Easy', 'shared', true, 'cash', false, 3, 0.00, false
  );

-- Self Care Tasks (with accountability partner options)
INSERT INTO public.tasks (
  id, title, description, category_id, payment, duration_minutes, difficulty,
  task_type, is_active, payment_type, allow_accountability_partners, max_partners,
  partner_payment, flexible_barter
) VALUES
  (
    gen_random_uuid(),
    'Meditation Accountability',
    'Solo meditation practice with optional accountability partner for encouragement.',
    (SELECT id FROM public.task_categories WHERE name = 'Self Care' LIMIT 1),
    5.00, 20, 'Easy', 'solo', true, 'cash', true, 2, 2.00, false
  ),
  (
    gen_random_uuid(),
    'Evening Self-Care Routine',
    'Personal evening routine: bath, skincare, reading. Accountability partners welcome for support.',
    (SELECT id FROM public.task_categories WHERE name = 'Self Care' LIMIT 1),
    8.00, 45, 'Easy', 'solo', true, 'cash', true, 3, 3.00, false
  );

-- Verify the data was inserted successfully
SELECT 'Task Categories Created' as status, COUNT(*) as count FROM public.task_categories;
SELECT 'Tasks Created' as status, COUNT(*) as count FROM public.tasks;

-- Show sample data
SELECT 
    tc.name as category,
    COUNT(t.id) as task_count,
    AVG(t.payment::numeric) as avg_payment
FROM public.task_categories tc
LEFT JOIN public.tasks t ON t.category_id = tc.id
GROUP BY tc.name
ORDER BY tc.name;

-- Show all tasks with their categories
SELECT 
    t.title,
    tc.name as category, 
    t.payment,
    t.duration_minutes,
    t.difficulty,
    t.task_type,
    t.allow_accountability_partners
FROM public.tasks t
JOIN public.task_categories tc ON t.category_id = tc.id
ORDER BY tc.name, t.title;
-- Add demo tasks to Supabase database
-- Run this in your Supabase SQL Editor

-- Insert demo tasks for each category
INSERT INTO public.tasks (
    title, 
    description, 
    category_id, 
    payment, 
    duration_minutes, 
    difficulty, 
    task_type,
    is_active
) VALUES
-- Cooking tasks
('Prep Family Breakfast', 'Help prep healthy breakfast for 4 people. Tasks include chopping fruit, making oatmeal, and setting table.', 
 (SELECT id FROM public.task_categories WHERE name = 'Cooking'), 
 15.00, 45, 'Easy', 'shared', true),

('Sunday Meal Prep', 'Prepare 5 healthy lunches for the week. Includes shopping, cooking, and portioning meals.', 
 (SELECT id FROM public.task_categories WHERE name = 'Cooking'), 
 35.00, 120, 'Medium', 'shared', true),

-- Cleaning tasks  
('Quick Home Tidy', 'Help tidy living room, kitchen, and one bathroom. Light cleaning and organizing.', 
 (SELECT id FROM public.task_categories WHERE name = 'Cleaning'), 
 20.00, 60, 'Easy', 'shared', true),

('Deep Kitchen Clean', 'Deep clean kitchen including appliances, counters, floors, and organizing pantry.', 
 (SELECT id FROM public.task_categories WHERE name = 'Cleaning'), 
 45.00, 150, 'Hard', 'shared', true),

-- Childcare tasks
('After School Supervision', 'Pick up kids from school, help with homework, and supervise until parent returns.', 
 (SELECT id FROM public.task_categories WHERE name = 'Childcare'), 
 25.00, 180, 'Medium', 'shared', true),

('Weekend Playdate Host', 'Host and supervise 4-6 kids for a fun playdate with games and snacks.', 
 (SELECT id FROM public.task_categories WHERE name = 'Childcare'), 
 40.00, 240, 'Medium', 'shared', true),

-- Exercise tasks
('Morning Walk Group', 'Join or lead a 30-minute neighborhood walk. Great for meeting neighbors and staying active!', 
 (SELECT id FROM public.task_categories WHERE name = 'Exercise'), 
 8.00, 30, 'Easy', 'shared', true),

('Family Yoga Session', 'Lead a relaxing family yoga session in the park. All skill levels welcome.', 
 (SELECT id FROM public.task_categories WHERE name = 'Exercise'), 
 18.00, 60, 'Easy', 'shared', true),

-- Errands tasks
('Grocery Run Helper', 'Help with weekly grocery shopping - driving, carrying bags, organizing at home.', 
 (SELECT id FROM public.task_categories WHERE name = 'Errands'), 
 22.00, 90, 'Easy', 'shared', true),

('School Supply Shopping', 'Help shop for back-to-school supplies for 2 kids. List provided.', 
 (SELECT id FROM public.task_categories WHERE name = 'Errands'), 
 28.00, 75, 'Easy', 'shared', true),

-- Self Care tasks
('Meditation Accountability', 'Solo meditation practice with optional accountability partner for encouragement.', 
 (SELECT id FROM public.task_categories WHERE name = 'Self Care'), 
 5.00, 20, 'Easy', 'solo', true),

('Evening Self-Care Routine', 'Personal evening routine: bath, skincare, reading. Accountability partners welcome for support.', 
 (SELECT id FROM public.task_categories WHERE name = 'Self Care'), 
 8.00, 45, 'Easy', 'solo', true);

-- Verify the data was inserted
SELECT 
    t.title, 
    tc.name as category,
    t.payment,
    t.duration_minutes,
    t.difficulty,
    t.task_type
FROM public.tasks t
JOIN public.task_categories tc ON t.category_id = tc.id
ORDER BY tc.name, t.title;
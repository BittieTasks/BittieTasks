-- Complete SQL to create categories and platform tasks for BittieTasks marketplace
-- Run this directly in Supabase Dashboard → SQL Editor

-- First, create the task categories (if they don't exist)
INSERT INTO task_categories (id, name, description, icon, color) VALUES
(gen_random_uuid(), 'Activity Coordination', 'Organizing playdates, group activities, events', 'calendar', '#8b5cf6'),
(gen_random_uuid(), 'Errands & Shopping', 'Grocery runs, pharmacy pickups, general errands', 'shopping-cart', '#10b981'),
(gen_random_uuid(), 'Household Tasks', 'Cleaning, organization, home maintenance', 'home', '#84cc16'),
(gen_random_uuid(), 'Meal Planning & Prep', 'Meal planning, batch cooking, family dinners', 'chef-hat', '#f59e0b'),
(gen_random_uuid(), 'Pet Care', 'Dog walking, pet sitting, vet visits', 'heart', '#f97316'),
(gen_random_uuid(), 'Self-Care & Wellness', 'Walking groups, meditation, wellness activities', 'heart', '#ec4899'),
(gen_random_uuid(), 'Skill Sharing', 'Tutoring, lessons, teaching new skills', 'book-open', '#06b6d4'),
(gen_random_uuid(), 'Transportation', 'School pickups, carpooling, activity transportation', 'car', '#3b82f6')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for task creation
DO $$
DECLARE
    household_id UUID;
    meal_prep_id UUID;
    activity_id UUID;
    wellness_id UUID;
    skill_id UUID;
    errands_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO household_id FROM task_categories WHERE name = 'Household Tasks' LIMIT 1;
    SELECT id INTO meal_prep_id FROM task_categories WHERE name = 'Meal Planning & Prep' LIMIT 1;
    SELECT id INTO activity_id FROM task_categories WHERE name = 'Activity Coordination' LIMIT 1;
    SELECT id INTO wellness_id FROM task_categories WHERE name = 'Self-Care & Wellness' LIMIT 1;
    SELECT id INTO skill_id FROM task_categories WHERE name = 'Skill Sharing' LIMIT 1;
    SELECT id INTO errands_id FROM task_categories WHERE name = 'Errands & Shopping' LIMIT 1;

    -- Insert platform-funded tasks with proper category references
    INSERT INTO tasks (id, title, description, category_id, created_at, difficulty) VALUES
    (gen_random_uuid(), 'Organize Kids'' Artwork Portfolio - Earn $35', 'Platform-funded task: Create a digital portfolio of your child''s artwork throughout the year. Complete documentation and earn $35 for sharing your organization system with other families. This is paid directly by BittieTasks platform.', household_id, NOW(), 'beginner'),

    (gen_random_uuid(), 'Weekly Meal Prep System - Earn $42', 'Platform-funded opportunity: Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your efficient meal planning system. Payment provided by BittieTasks platform budget.', meal_prep_id, NOW(), 'intermediate'),

    (gen_random_uuid(), 'Budget Birthday Party Planning - Earn $38', 'Platform task: Plan and execute a memorable birthday party for under $50. Earn $38 for documenting decorations, activities, and timeline for other parents. Funded by BittieTasks platform revenue.', activity_id, NOW(), 'intermediate'),

    (gen_random_uuid(), 'Family Fitness Routine - Earn $45', 'Platform-funded: Create a comprehensive fitness program that families can do together in small spaces. Earn $45 for your exercise guide and video demonstrations. Payment guaranteed by platform.', wellness_id, NOW(), 'intermediate'),

    (gen_random_uuid(), 'Math Practice Games for Kids - Earn $52', 'Platform education task: Create visual, auditory, and kinesthetic math games that make practice enjoyable for children. Highest payout at $52 for quality educational content. Platform-funded earning opportunity.', skill_id, NOW(), 'advanced'),

    (gen_random_uuid(), 'After-School Snack Prep - Earn $32', 'Platform-funded: Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips. Earn $32 from BittieTasks platform budget.', meal_prep_id, NOW(), 'beginner'),

    (gen_random_uuid(), 'Pantry Organization System - Earn $28', 'Platform task: Design an efficient pantry organization system with clear labeling for easy meal planning. Earn $28 for your detailed organization guide. Platform-funded opportunity.', household_id, NOW(), 'beginner'),

    (gen_random_uuid(), 'Reading Comprehension Activities - Earn $45', 'Platform education task: Create engaging activities that improve reading skills for elementary students. Earn $45 for your educational materials and implementation guide. Funded by platform revenue.', skill_id, NOW(), 'intermediate'),

    (gen_random_uuid(), 'Morning Routine Optimization - Earn $30', 'Platform-funded: Design 15-minute morning routines that reduce stress and increase energy for busy families. Earn $30 for your routine guide and time-saving tips. BittieTasks platform payment.', wellness_id, NOW(), 'beginner'),

    (gen_random_uuid(), 'Digital Photo Organization - Earn $30', 'Platform task: Create a family photo organization system with cloud storage and easy retrieval methods. Earn $30 for your digital organization system. Funded by BittieTasks platform budget.', household_id, NOW(), 'beginner');

END $$;

-- Verify the results
SELECT 
  tc.name as category_name,
  COUNT(t.id) as task_count,
  STRING_AGG(SUBSTRING(t.title, 1, 30) || '...', ', ') as sample_tasks
FROM task_categories tc
LEFT JOIN tasks t ON tc.id = t.category_id
WHERE t.title LIKE '%Earn $%'
GROUP BY tc.name, tc.id
ORDER BY task_count DESC;

-- Show total platform task value
SELECT 
  COUNT(*) as total_platform_tasks,
  '$370' as total_earning_potential,
  'Platform-funded tasks ready!' as status
FROM tasks 
WHERE title LIKE '%Earn $%';
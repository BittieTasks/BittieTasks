-- SQL to create 10 platform-funded tasks for BittieTasks marketplace
-- Run this directly in Supabase Dashboard → SQL Editor

-- Insert platform-funded tasks with proper UUIDs
INSERT INTO tasks (id, title, description, category_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'Organize Kids'' Artwork Portfolio - Earn $35', 'Platform-funded task: Create a digital portfolio of your child''s artwork throughout the year. Complete documentation and earn $35 for sharing your organization system with other families. This is paid directly by BittieTasks platform.', '34fad69c-9fa9-4d9c-ae89-f0bf776718a9', NOW(), NOW()),

(gen_random_uuid(), 'Weekly Meal Prep System - Earn $42', 'Platform-funded opportunity: Develop and document a weekly meal prep routine that saves 30+ minutes every morning. Earn $42 for sharing your efficient meal planning system. Payment provided by BittieTasks platform budget.', '8fae75e1-d928-4cf5-8fd7-eb3adb2e89fa', NOW(), NOW()),

(gen_random_uuid(), 'Budget Birthday Party Planning - Earn $38', 'Platform task: Plan and execute a memorable birthday party for under $50. Earn $38 for documenting decorations, activities, and timeline for other parents. Funded by BittieTasks platform revenue.', '542f5561-f6f0-46c5-be36-217c37f80d3e', NOW(), NOW()),

(gen_random_uuid(), 'Family Fitness Routine - Earn $45', 'Platform-funded: Create a comprehensive fitness program that families can do together in small spaces. Earn $45 for your exercise guide and video demonstrations. Payment guaranteed by platform.', 'd4d07719-61b1-42f0-9fce-603571a14e4d', NOW(), NOW()),

(gen_random_uuid(), 'Math Practice Games for Kids - Earn $52', 'Platform education task: Create visual, auditory, and kinesthetic math games that make practice enjoyable for children. Highest payout at $52 for quality educational content. Platform-funded earning opportunity.', 'b12fe201-482a-421f-bca0-a417d9787f7f', NOW(), NOW()),

(gen_random_uuid(), 'After-School Snack Prep - Earn $32', 'Platform-funded: Develop healthy, kid-approved snacks that can be prepped in advance. Include nutritional info and storage tips. Earn $32 from BittieTasks platform budget.', '8fae75e1-d928-4cf5-8fd7-eb3adb2e89fa', NOW(), NOW()),

(gen_random_uuid(), 'Pantry Organization System - Earn $28', 'Platform task: Design an efficient pantry organization system with clear labeling for easy meal planning. Earn $28 for your detailed organization guide. Platform-funded opportunity.', 'c3a4c5ec-62b2-48c8-9ce8-741a6e127f27', NOW(), NOW()),

(gen_random_uuid(), 'Reading Comprehension Activities - Earn $45', 'Platform education task: Create engaging activities that improve reading skills for elementary students. Earn $45 for your educational materials and implementation guide. Funded by platform revenue.', 'b12fe201-482a-421f-bca0-a417d9787f7f', NOW(), NOW()),

(gen_random_uuid(), 'Morning Routine Optimization - Earn $30', 'Platform-funded: Design 15-minute morning routines that reduce stress and increase energy for busy families. Earn $30 for your routine guide and time-saving tips. BittieTasks platform payment.', 'd4d07719-61b1-42f0-9fce-603571a14e4d', NOW(), NOW()),

(gen_random_uuid(), 'Digital Photo Organization - Earn $30', 'Platform task: Create a family photo organization system with cloud storage and easy retrieval methods. Earn $30 for your digital organization system. Funded by BittieTasks platform budget.', 'c3a4c5ec-62b2-48c8-9ce8-741a6e127f27', NOW(), NOW());

-- Verify insertion worked
SELECT 
  id, 
  title, 
  LEFT(description, 100) || '...' AS description_preview,
  category_id,
  created_at
FROM tasks 
WHERE title LIKE '%Earn $%'
ORDER BY created_at DESC;
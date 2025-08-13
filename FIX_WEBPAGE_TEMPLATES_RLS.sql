-- Fix RLS policy for webpage_templates table
-- This table has RLS enabled but no policies, causing a security warning

-- Add RLS policy for webpage_templates
CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: If you want more granular control
-- CREATE POLICY "Users can view webpage templates" ON public.webpage_templates
-- FOR SELECT USING (true);
-- 
-- CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
-- FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated users can update webpage templates" ON public.webpage_templates
-- FOR UPDATE USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated users can delete webpage templates" ON public.webpage_templates
-- FOR DELETE USING (auth.role() = 'authenticated');
-- Create function to safely increment user earnings and task count
CREATE OR REPLACE FUNCTION increment_user_stats(
  target_user_id TEXT,
  earnings_increment DECIMAL,
  tasks_increment INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET 
    total_earnings = COALESCE(total_earnings, 0) + earnings_increment,
    tasks_completed = COALESCE(tasks_completed, 0) + tasks_increment,
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;
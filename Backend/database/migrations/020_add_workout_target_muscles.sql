DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='target_muscles') THEN
    ALTER TABLE workouts ADD COLUMN target_muscles TEXT;
  END IF;
END $$;


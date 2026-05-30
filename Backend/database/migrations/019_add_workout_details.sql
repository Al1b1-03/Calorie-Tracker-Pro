DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='benefits') THEN
    ALTER TABLE workouts ADD COLUMN benefits TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='how_to') THEN
    ALTER TABLE workouts ADD COLUMN how_to TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='regime') THEN
    ALTER TABLE workouts ADD COLUMN regime TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='important') THEN
    ALTER TABLE workouts ADD COLUMN important TEXT;
  END IF;
END $$;


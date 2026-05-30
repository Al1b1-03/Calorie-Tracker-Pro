-- Добавляем категорию тренировки: arms/core/chest/back/legs/cardio/other
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='category') THEN
    ALTER TABLE workouts ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'other';
  END IF;
END $$;


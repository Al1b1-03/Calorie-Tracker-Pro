-- AI food scans history
CREATE TABLE IF NOT EXISTS food_scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  dish_name VARCHAR(255),
  ingredients JSONB DEFAULT '[]'::jsonb,
  estimated_weight_g INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  protein DECIMAL(6,2) DEFAULT 0,
  fat DECIMAL(6,2) DEFAULT 0,
  carbs DECIMAL(6,2) DEFAULT 0,
  confidence DECIMAL(4,3) DEFAULT 0,
  provider VARCHAR(32) DEFAULT 'mock',
  raw_response JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  entry_id INTEGER REFERENCES food_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_scans_created_at ON food_scans(created_at DESC);

-- Daily water intake logs
CREATE TABLE IF NOT EXISTS water_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  log_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, log_date);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='water_goal_ml') THEN
    ALTER TABLE users ADD COLUMN water_goal_ml INTEGER DEFAULT 2000;
  END IF;
END $$;

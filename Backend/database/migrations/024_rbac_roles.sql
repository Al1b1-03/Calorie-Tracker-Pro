-- RBAC: USER | ADMIN | SUPER_ADMIN
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_role;

    UPDATE users SET role = 'USER' WHERE LOWER(role) = 'user';
    UPDATE users SET role = 'ADMIN' WHERE LOWER(role) = 'admin';

    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'SUPER_ADMIN') THEN
      UPDATE users
      SET role = 'SUPER_ADMIN'
      WHERE id = (
        SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1
      );
    END IF;

    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';
    ALTER TABLE users ADD CONSTRAINT chk_role
      CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));
  END IF;
END $$;

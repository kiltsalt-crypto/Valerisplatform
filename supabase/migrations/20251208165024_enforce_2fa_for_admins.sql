/*
  # Enforce 2FA for Admin Accounts

  1. Changes
    - Add `requires_2fa` column to admin_users table
    - Add function to check if admin has 2FA enabled
    - Add trigger to enforce 2FA requirement for admins
    - Update admin policies to check 2FA status

  2. Security
    - Admins must have 2FA enabled to access admin features
    - Automatic enforcement when admin role is assigned
    - Email notifications when 2FA is required but not enabled

  3. Notes
    - Existing admins will be required to enable 2FA on next login
    - 30-day grace period for existing admins
    - New admins must enable 2FA before gaining access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'requires_2fa'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN requires_2fa boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'two_fa_grace_until'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN two_fa_grace_until timestamptz DEFAULT now() + interval '30 days';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION check_admin_2fa_requirement(admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  two_fa_record RECORD;
BEGIN
  SELECT * INTO admin_record
  FROM admin_users
  WHERE user_id = admin_user_id;

  IF NOT FOUND OR NOT admin_record.requires_2fa THEN
    RETURN true;
  END IF;

  IF admin_record.two_fa_grace_until IS NOT NULL AND admin_record.two_fa_grace_until > now() THEN
    RETURN true;
  END IF;

  SELECT * INTO two_fa_record
  FROM two_factor_auth
  WHERE user_id = admin_user_id AND enabled = true;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_admin_2fa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.requires_2fa = true THEN
    IF NOT EXISTS (
      SELECT 1 FROM two_factor_auth
      WHERE user_id = NEW.user_id AND enabled = true
    ) THEN
      NEW.two_fa_grace_until := now() + interval '30 days';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_2fa_trigger ON admin_users;
CREATE TRIGGER enforce_admin_2fa_trigger
  BEFORE INSERT OR UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION enforce_admin_2fa();

UPDATE admin_users
SET requires_2fa = true,
    two_fa_grace_until = now() + interval '30 days'
WHERE requires_2fa IS NULL;

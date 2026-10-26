-- ============================================================
-- Day One CRM — Force password change on first login (team members)
-- Admin-created EMPLOYEE / PROJECT_MANAGER accounts are provisioned
-- with a temporary password. This column tracks whether the user
-- still needs to replace it before accessing the app.
-- Run AFTER 017_*.sql
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.must_change_password IS
  'True until the user replaces the admin-provisioned temporary password. Cleared after first successful change.';

-- Existing rows default to FALSE (no forced change for legacy users).

-- ─── Prevent tampering ───────────────────────────────────────
-- A non-admin user must not be able to clear this flag directly
-- (e.g. via the client) without actually changing their password.
-- Service-role (auth.uid() IS NULL) is allowed so server actions can
-- clear it after a verified password change.

CREATE OR REPLACE FUNCTION public.guard_must_change_password()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'must_change_password can only be changed by an administrator'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_guard_must_change_password ON public.profiles;
CREATE TRIGGER profiles_guard_must_change_password
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_must_change_password();
-- ============================================================
-- Day One CRM — Internal Team: roles + department
-- Adds EMPLOYEE / PROJECT_MANAGER roles and a department field.
-- Task board tables live in a later migration.
-- Run AFTER 010_startup_monthly_metrics.sql
-- ============================================================

-- ─── PROFILES: new roles + department ────────────────────────

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('ADMIN', 'FOUNDER', 'STAFF', 'VENTURE_MANAGER', 'EMPLOYEE', 'PROJECT_MANAGER'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department TEXT;

COMMENT ON COLUMN public.profiles.department IS 'Internal department for EMPLOYEE / PROJECT_MANAGER profiles';

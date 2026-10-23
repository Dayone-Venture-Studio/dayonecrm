-- ============================================================
-- Daily Feed Visibility Fix Script
-- Run this AFTER running the diagnostic script to fix common issues
-- ============================================================

-- FIX 1: Apply the correct RLS policy (migration 016)
-- This allows all EMPLOYEE, PROJECT_MANAGER, and ADMIN roles to see all reports

DROP POLICY IF EXISTS "daily_reports_select_own" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_select_team" ON public.daily_reports;

CREATE POLICY "daily_reports_select_team"
  ON public.daily_reports FOR SELECT
  USING (public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN'));

-- Verify the policy was created
SELECT 
  'POLICY CHECK' as status,
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'daily_reports' AND cmd = 'SELECT';

-- ============================================================

-- FIX 2: Update any profiles that have NULL or incorrect roles
-- (Run this only if diagnostic script showed users with NULL roles)

-- UNCOMMENT the lines below if needed:

-- Update all users without a role to EMPLOYEE
-- UPDATE profiles 
-- SET role = 'EMPLOYEE' 
-- WHERE role IS NULL;

-- Verify roles after update
-- SELECT 
--   'ROLE UPDATE CHECK' as status,
--   email, 
--   full_name, 
--   role 
-- FROM profiles 
-- ORDER BY created_at DESC;

-- ============================================================

-- FIX 3: Verify RLS is enabled on the table
-- (Should already be enabled, but check just in case)

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

SELECT 
  'RLS STATUS CHECK' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'daily_reports';

-- ============================================================

-- FIX 4: Test visibility after fixes
-- Count reports visible to current user

SELECT 
  'VISIBILITY TEST' as status,
  COUNT(*) as reports_i_can_see,
  COUNT(DISTINCT user_id) as unique_authors,
  COUNT(DISTINCT report_date) as unique_dates
FROM daily_reports;

-- Show today's reports with author details
SELECT 
  'TODAYS REPORTS AFTER FIX' as status,
  p.full_name,
  p.role,
  dr.submitted_at::time as time_submitted,
  CASE 
    WHEN dr.user_id = auth.uid() THEN '✓ MY REPORT'
    ELSE '👥 TEAM REPORT'
  END as type
FROM daily_reports dr
LEFT JOIN profiles p ON dr.user_id = p.id
WHERE dr.report_date = CURRENT_DATE
ORDER BY dr.submitted_at;

-- ============================================================
-- EXPECTED RESULTS AFTER FIX:
-- ============================================================
-- 
-- POLICY CHECK: Should show 'daily_reports_select_team' policy
-- RLS STATUS CHECK: rls_enabled should be TRUE
-- VISIBILITY TEST: Should show all reports from all team members
-- TODAYS REPORTS: Should show both 'MY REPORT' and 'TEAM REPORT' entries
--
-- ============================================================

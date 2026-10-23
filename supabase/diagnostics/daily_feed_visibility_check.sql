-- ============================================================
-- Daily Feed Visibility Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose why reports aren't visible
-- ============================================================

-- 1. Check RLS Policies on daily_reports table
SELECT 
  '1. RLS POLICIES' as check_type,
  schemaname, 
  tablename, 
  policyname, 
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'daily_reports'
ORDER BY policyname;

-- 2. Check if user_role() function exists and works
SELECT 
  '2. USER_ROLE FUNCTION TEST' as check_type,
  public.user_role() as current_user_role,
  auth.uid() as current_user_id;

-- 3. Check all user profiles and their roles
SELECT 
  '3. ALL USER PROFILES' as check_type,
  id,
  email,
  full_name,
  role,
  department,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Check all daily reports
SELECT 
  '4. ALL DAILY REPORTS' as check_type,
  dr.id,
  dr.user_id,
  p.full_name as author_name,
  p.email as author_email,
  p.role as author_role,
  dr.report_date,
  dr.submitted_at,
  dr.content
FROM daily_reports dr
LEFT JOIN profiles p ON dr.user_id = p.id
ORDER BY dr.report_date DESC, dr.submitted_at DESC;

-- 5. Test visibility from current user's perspective
SELECT 
  '5. REPORTS VISIBLE TO ME' as check_type,
  COUNT(*) as total_reports_i_can_see,
  COUNT(DISTINCT report_date) as unique_dates,
  COUNT(DISTINCT user_id) as unique_authors
FROM daily_reports;

-- 6. Check if there are reports I cannot see (will be 0 if all visible)
SELECT 
  '6. REPORTS I CANNOT SEE' as check_type,
  COUNT(*) as reports_blocked_by_rls
FROM (
  SELECT 1 FROM daily_reports WHERE FALSE
  -- This is a trick: if RLS blocks everything, this returns 0
  -- We need to compare with total count from admin view
) blocked;

-- 7. Check reports for today
SELECT 
  '7. TODAYS REPORTS' as check_type,
  dr.id,
  p.full_name,
  p.role,
  dr.submitted_at,
  CASE 
    WHEN dr.user_id = auth.uid() THEN 'MY REPORT'
    ELSE 'OTHER USER REPORT'
  END as ownership
FROM daily_reports dr
LEFT JOIN profiles p ON dr.user_id = p.id
WHERE dr.report_date = CURRENT_DATE
ORDER BY dr.submitted_at;

-- 8. Detailed RLS policy check - what the policy actually evaluates to
SELECT 
  '8. RLS EVALUATION' as check_type,
  auth.uid() as my_user_id,
  public.user_role() as my_role,
  public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN') as policy_should_allow,
  CASE 
    WHEN public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN') 
    THEN 'RLS POLICY ALLOWS ACCESS'
    ELSE 'RLS POLICY BLOCKS ACCESS - FIX REQUIRED'
  END as diagnosis;

-- 9. Check if RLS is enabled on the table
SELECT 
  '9. RLS STATUS' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'daily_reports';

-- ============================================================
-- INTERPRETATION GUIDE:
-- ============================================================
-- 
-- Check 1: Should show policy named 'daily_reports_select_team'
--   - If you see 'daily_reports_select_own' instead, migration 016 wasn't applied
--
-- Check 2: Should return your role (e.g., 'EMPLOYEE')
--   - If NULL, your profile.role is not set
--
-- Check 3: All users should have role = 'EMPLOYEE', 'PROJECT_MANAGER', or 'ADMIN'
--   - If NULL or other values, update the profile
--
-- Check 5: Should show all reports across all users
--   - If you only see 1 author and it's yourself, RLS is blocking others
--
-- Check 8: Should say 'RLS POLICY ALLOWS ACCESS'
--   - If it says 'BLOCKS', your role is not in the allowed list
--
-- ============================================================

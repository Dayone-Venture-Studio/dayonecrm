-- ============================================================
-- Day One CRM — Team members can read each other's profiles
-- Runs AFTER 011 (roles) and 012 (team tasks).
--
-- Why: the assignee picker on /daily-sprint (and the PM filters)
-- calls getAllTeamMembers(), which SELECTs other rows from
-- profiles. The only SELECT policy (009) allowed self / ADMIN /
-- VENTURE_MANAGER, so a PROJECT_MANAGER or EMPLOYEE could only
-- ever see their own profile — the dropdown came back empty.
--
-- Fix: add a second, permissive SELECT policy so any EMPLOYEE /
-- PROJECT_MANAGER may read the profiles of other EMPLOYEE /
-- PROJECT_MANAGER rows. Permissive policies are OR'd, so this
-- adds access without removing the existing self/admin rule.
-- Scoped to team roles so team members still cannot read
-- founders, staff, etc.
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_team" ON public.profiles;
CREATE POLICY "profiles_select_team" ON public.profiles
  FOR SELECT USING (
    public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER')
    AND role IN ('EMPLOYEE', 'PROJECT_MANAGER')
  );

-- A team member can also read the profile of any ADMIN (task
-- creator / manager labels), while still not seeing founders.
DROP POLICY IF EXISTS "profiles_select_team_admin" ON public.profiles;
CREATE POLICY "profiles_select_team_admin" ON public.profiles
  FOR SELECT USING (
    public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER')
    AND role = 'ADMIN'
  );

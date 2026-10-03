-- ============================================================
-- Migration 009: Add VENTURE_MANAGER to RLS policies
-- VENTURE_MANAGER needs read access to all portfolio data
-- ============================================================

-- Helper function: check if current user is a VENTURE_MANAGER
CREATE OR REPLACE FUNCTION public.is_venture_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'VENTURE_MANAGER');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES ────────────────────────────────────────────────
-- Venture managers need to read all profiles (founder names, etc.)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin() OR public.is_venture_manager()
  );

-- ─── STARTUPS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "startups_select" ON public.startups;
CREATE POLICY "startups_select" ON public.startups
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(id)
  );

-- ─── STARTUP MEMBERS ────────────────────────────────────────
DROP POLICY IF EXISTS "startup_members_select" ON public.startup_members;
CREATE POLICY "startup_members_select" ON public.startup_members
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(startup_id)
  );

-- ─── DOMAINS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "domains_select" ON public.domains;
CREATE POLICY "domains_select" ON public.domains
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(startup_id)
  );

-- ─── WEEKLY PLANS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "weekly_plans_select" ON public.weekly_plans;
CREATE POLICY "weekly_plans_select" ON public.weekly_plans
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(startup_id)
  );

-- ─── TASKS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(startup_id)
  );

-- ─── TASK UPDATES ────────────────────────────────────────────
DROP POLICY IF EXISTS "task_updates_select" ON public.task_updates;
CREATE POLICY "task_updates_select" ON public.task_updates
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND public.is_member_of(t.startup_id)
    )
  );

-- ─── WEEKLY PERFORMANCE ───────────────────────────────────────
DROP POLICY IF EXISTS "weekly_performance_select" ON public.weekly_performance;
CREATE POLICY "weekly_performance_select" ON public.weekly_performance
  FOR SELECT USING (
    public.is_admin() OR public.is_venture_manager() OR public.is_member_of(startup_id)
  );

-- ─── ACTIVITY LOGS ───────────────────────────────────────────
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT USING (
    public.is_admin()
    OR public.is_venture_manager()
    OR (startup_id IS NOT NULL AND public.is_member_of(startup_id))
  );

-- ─── VENTURE MANAGER NOTES ───────────────────────────────────
ALTER TABLE public.venture_manager_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vm_notes_select" ON public.venture_manager_notes;
CREATE POLICY "vm_notes_select" ON public.venture_manager_notes
  FOR SELECT USING (public.is_admin() OR public.is_venture_manager());

DROP POLICY IF EXISTS "vm_notes_insert" ON public.venture_manager_notes;
CREATE POLICY "vm_notes_insert" ON public.venture_manager_notes
  FOR INSERT WITH CHECK (public.is_venture_manager() AND created_by = auth.uid());

DROP POLICY IF EXISTS "vm_notes_update" ON public.venture_manager_notes;
CREATE POLICY "vm_notes_update" ON public.venture_manager_notes
  FOR UPDATE USING (public.is_admin() OR (public.is_venture_manager() AND created_by = auth.uid()));

DROP POLICY IF EXISTS "vm_notes_delete" ON public.venture_manager_notes;
CREATE POLICY "vm_notes_delete" ON public.venture_manager_notes
  FOR DELETE USING (public.is_admin() OR (public.is_venture_manager() AND created_by = auth.uid()));

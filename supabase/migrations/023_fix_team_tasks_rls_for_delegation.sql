-- ============================================================
-- Fix team_tasks RLS for Venture Manager task delegation
-- Allows VENTURE_MANAGER to create team_tasks when delegating
-- Run AFTER 022_task_delegation.sql
-- ============================================================

-- Update team_tasks INSERT policy to allow VENTURE_MANAGER to create delegated tasks
DROP POLICY IF EXISTS "team_tasks_insert" ON public.team_tasks;
CREATE POLICY "team_tasks_insert" ON public.team_tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (
      -- Project managers and admins can create any task
      public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
      -- Employees can only create self-assigned tasks
      OR assigned_to = auth.uid()
      -- Venture managers can create delegated tasks (source_task_id will be set)
      OR (public.user_role() = 'VENTURE_MANAGER' AND source_task_id IS NOT NULL)
    )
  );

-- Update team_tasks SELECT policy to allow VENTURE_MANAGER to see delegated tasks
DROP POLICY IF EXISTS "team_tasks_select" ON public.team_tasks;
CREATE POLICY "team_tasks_select" ON public.team_tasks
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
    -- Venture managers can see tasks they created (delegated tasks)
    OR (public.user_role() = 'VENTURE_MANAGER' AND created_by = auth.uid())
  );

-- Update team_tasks UPDATE policy to allow VENTURE_MANAGER to update their delegated tasks
DROP POLICY IF EXISTS "team_tasks_update" ON public.team_tasks;
CREATE POLICY "team_tasks_update" ON public.team_tasks
  FOR UPDATE USING (
    public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
    OR assigned_to = auth.uid()
    -- Venture managers can update tasks they created (for reassignment)
    OR (public.user_role() = 'VENTURE_MANAGER' AND created_by = auth.uid())
  )
  WITH CHECK (
    public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
    OR assigned_to = auth.uid()
    OR (public.user_role() = 'VENTURE_MANAGER' AND created_by = auth.uid())
  );

COMMENT ON POLICY "team_tasks_insert" ON public.team_tasks IS 
  'PM/Admin: any task; Employee: self-assigned only; VM: delegated tasks (with source_task_id)';

-- ============================================================
-- Day One CRM — Task Delegation System
-- Allows VENTURE_MANAGER to delegate startup tasks to EMPLOYEE.
-- Creates bidirectional link between tasks and team_tasks.
-- Run AFTER 021_founder_read_startup_profiles.sql
-- ============================================================
--
-- PURPOSE:
--   Enable Venture Managers to delegate startup tasks to internal
--   Day One employees (EMPLOYEE role). VMs typically don't execute
--   tasks themselves but need to assign work to the internal team.
--
-- ARCHITECTURE:
--   - task_delegations: Junction table tracking the delegation relationship
--   - team_tasks.source_task_id: Back-reference to the original startup task
--   - team_tasks.startup_id: Denormalized startup reference for queries
--
-- WORKFLOW:
--   1. VM assigns a startup task to themselves (or it comes pre-assigned)
--   2. VM opens task detail modal in their Kanban view
--   3. VM selects an EMPLOYEE from dropdown and delegates the task
--   4. System creates a team_tasks entry linked via task_delegations
--   5. EMPLOYEE sees the task in their /daily-sprint board with "Startup Task" badge
--   6. Status updates sync bidirectionally (team_task ↔ startup task)
--   7. VM sees delegation status and employee progress in their Kanban
--
-- BIDIRECTIONAL SYNC:
--   Implemented in application layer (not triggers) for auditability:
--   - updateTeamTaskStatus (team/task-actions.ts) → syncs to tasks table
--   - updateTaskStatus (tasks/actions.ts) → syncs to team_tasks table
--   - Both include started_at and completed_at field syncing
--
-- RLS POLICIES:
--   - SELECT: VM who delegated, EMPLOYEE assigned, or ADMIN can see
--   - INSERT: Only VM or ADMIN can create delegations
--   - UPDATE: Only the delegating VM or ADMIN can update (for reassignment)
--   - DELETE: Only ADMIN (preserve audit trail)
--
-- USAGE EXAMPLE:
--   -- Query delegated tasks for an employee
--   SELECT tt.*, td.startup_task_id, s.name as startup_name
--   FROM team_tasks tt
--   JOIN task_delegations td ON tt.id = td.team_task_id
--   JOIN startups s ON tt.startup_id = s.id
--   WHERE tt.assigned_to = '<employee_id>'
--     AND tt.source_task_id IS NOT NULL;
--
-- ============================================================

-- ─── EXTEND TEAM_TASKS TABLE ────────────────────────────────
-- Add columns to link team_tasks back to startup tasks and provide context

ALTER TABLE public.team_tasks
  ADD COLUMN IF NOT EXISTS source_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.team_tasks.source_task_id IS 'Links to original startup task if this is a delegated task';
COMMENT ON COLUMN public.team_tasks.startup_id IS 'Reference to startup for delegated tasks, provides context';

CREATE INDEX IF NOT EXISTS idx_team_tasks_source_task ON public.team_tasks(source_task_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_startup ON public.team_tasks(startup_id);

-- ─── TASK DELEGATIONS TABLE ─────────────────────────────────
-- Tracks the delegation relationship and metadata

CREATE TABLE IF NOT EXISTS public.task_delegations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_task_id    UUID NOT NULL REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  delegated_by    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegated_to    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata        JSONB,
  UNIQUE(startup_task_id)
);

COMMENT ON TABLE public.task_delegations IS 'Links startup tasks delegated by VMs to internal team tasks assigned to EMPLOYEEs';
COMMENT ON COLUMN public.task_delegations.startup_task_id IS 'The original startup task being delegated';
COMMENT ON COLUMN public.task_delegations.team_task_id IS 'The created team_tasks entry for the EMPLOYEE';
COMMENT ON COLUMN public.task_delegations.delegated_by IS 'The VENTURE_MANAGER who delegated the task';
COMMENT ON COLUMN public.task_delegations.delegated_to IS 'The EMPLOYEE who received the task';
COMMENT ON COLUMN public.task_delegations.metadata IS 'Additional context: note, reason, previous assignments, etc.';

CREATE INDEX IF NOT EXISTS idx_task_delegations_startup_task ON public.task_delegations(startup_task_id);
CREATE INDEX IF NOT EXISTS idx_task_delegations_team_task ON public.task_delegations(team_task_id);
CREATE INDEX IF NOT EXISTS idx_task_delegations_delegated_by ON public.task_delegations(delegated_by);
CREATE INDEX IF NOT EXISTS idx_task_delegations_delegated_to ON public.task_delegations(delegated_to);
CREATE INDEX IF NOT EXISTS idx_task_delegations_delegated_at ON public.task_delegations(delegated_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE public.task_delegations ENABLE ROW LEVEL SECURITY;

-- SELECT: VM who delegated, EMPLOYEE who received, or ADMIN
DROP POLICY IF EXISTS "task_delegations_select" ON public.task_delegations;
CREATE POLICY "task_delegations_select" ON public.task_delegations
  FOR SELECT USING (
    delegated_by = auth.uid()
    OR delegated_to = auth.uid()
    OR public.user_role() = 'ADMIN'
    OR public.user_role() = 'VENTURE_MANAGER'
  );

-- INSERT: only VENTURE_MANAGER or ADMIN can create delegations
DROP POLICY IF EXISTS "task_delegations_insert" ON public.task_delegations;
CREATE POLICY "task_delegations_insert" ON public.task_delegations
  FOR INSERT WITH CHECK (
    delegated_by = auth.uid()
    AND public.user_role() IN ('VENTURE_MANAGER', 'ADMIN')
  );

-- UPDATE: only the delegating VM or ADMIN can update (for reassignment)
DROP POLICY IF EXISTS "task_delegations_update" ON public.task_delegations;
CREATE POLICY "task_delegations_update" ON public.task_delegations
  FOR UPDATE USING (
    delegated_by = auth.uid()
    OR public.user_role() = 'ADMIN'
  )
  WITH CHECK (
    delegated_by = auth.uid()
    OR public.user_role() = 'ADMIN'
  );

-- DELETE: only ADMIN can delete delegation records (preserve audit trail)
DROP POLICY IF EXISTS "task_delegations_delete" ON public.task_delegations;
CREATE POLICY "task_delegations_delete" ON public.task_delegations
  FOR DELETE USING (public.user_role() = 'ADMIN');

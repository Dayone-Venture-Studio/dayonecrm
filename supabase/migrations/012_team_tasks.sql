-- ============================================================
-- Day One CRM — Internal Team Tasks
-- Kanban task board for EMPLOYEE / PROJECT_MANAGER.
-- Depends on 011_team_management.sql (roles + department).
-- Run AFTER 011_team_management.sql
-- ============================================================

-- ─── TEAM TASKS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.team_tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority    TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date    DATE,
  department  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned_to ON public.team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_created_by ON public.team_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON public.team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_department ON public.team_tasks(department);
CREATE INDEX IF NOT EXISTS idx_team_tasks_created_at ON public.team_tasks(created_at DESC);

-- ─── TEAM TASK COMMENTS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.team_task_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID NOT NULL REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_task_comments_task ON public.team_task_comments(task_id, created_at);

-- ─── TEAM TASK ACTIVITIES (status-change history) ────────────

CREATE TABLE IF NOT EXISTS public.team_task_activities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_status TEXT CHECK (from_status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  to_status   TEXT NOT NULL CHECK (to_status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_task_activities_task ON public.team_task_activities(task_id, created_at DESC);

-- ─── updated_at trigger ──────────────────────────────────────

DROP TRIGGER IF EXISTS update_team_tasks_updated_at ON public.team_tasks;
CREATE TRIGGER update_team_tasks_updated_at
  BEFORE UPDATE ON public.team_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_task_activities ENABLE ROW LEVEL SECURITY;

-- team_tasks: assigned member, or any project manager / admin
DROP POLICY IF EXISTS "team_tasks_select" ON public.team_tasks;
CREATE POLICY "team_tasks_select" ON public.team_tasks
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
  );

-- insert: PM/admin any assignment; EMPLOYEE only self-assigned + self-created
DROP POLICY IF EXISTS "team_tasks_insert" ON public.team_tasks;
CREATE POLICY "team_tasks_insert" ON public.team_tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (
      public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
      OR assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "team_tasks_update" ON public.team_tasks;
CREATE POLICY "team_tasks_update" ON public.team_tasks
  FOR UPDATE USING (
    public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
    OR assigned_to = auth.uid()
  )
  WITH CHECK (
    public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
    OR assigned_to = auth.uid()
  );

DROP POLICY IF EXISTS "team_tasks_delete" ON public.team_tasks;
CREATE POLICY "team_tasks_delete" ON public.team_tasks
  FOR DELETE USING (public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'));

-- comments: access follows the parent task
DROP POLICY IF EXISTS "team_task_comments_select" ON public.team_task_comments;
CREATE POLICY "team_task_comments_select" ON public.team_task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_tasks t
      WHERE t.id = team_task_comments.task_id
        AND (t.assigned_to = auth.uid() OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "team_task_comments_insert" ON public.team_task_comments;
CREATE POLICY "team_task_comments_insert" ON public.team_task_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.team_tasks t
      WHERE t.id = team_task_comments.task_id
        AND (t.assigned_to = auth.uid() OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'))
    )
  );

-- activities: access follows the parent task; append-only
DROP POLICY IF EXISTS "team_task_activities_select" ON public.team_task_activities;
CREATE POLICY "team_task_activities_select" ON public.team_task_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_tasks t
      WHERE t.id = team_task_activities.task_id
        AND (t.assigned_to = auth.uid() OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "team_task_activities_insert" ON public.team_task_activities;
CREATE POLICY "team_task_activities_insert" ON public.team_task_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.team_tasks t
      WHERE t.id = team_task_activities.task_id
        AND (t.assigned_to = auth.uid() OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'))
    )
  );

COMMENT ON TABLE public.team_tasks IS 'Internal team tasks, separate from startup tasks';
COMMENT ON TABLE public.team_task_comments IS 'Threaded comments on internal team tasks';
COMMENT ON TABLE public.team_task_activities IS 'Status-change history for internal team tasks';

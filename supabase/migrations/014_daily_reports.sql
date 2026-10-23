-- ============================================================
-- Day One CRM — Daily Reports (morning standup submission)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_date   DATE NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date
  ON public.daily_reports (user_id, report_date DESC);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_reports_select_own" ON public.daily_reports;
CREATE POLICY "daily_reports_select_own"
  ON public.daily_reports FOR SELECT
  USING (user_id = auth.uid() OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'));

DROP POLICY IF EXISTS "daily_reports_insert_own" ON public.daily_reports;
CREATE POLICY "daily_reports_insert_own"
  ON public.daily_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "daily_reports_update_own" ON public.daily_reports;
CREATE POLICY "daily_reports_update_own"
  ON public.daily_reports FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON public.daily_reports;
CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
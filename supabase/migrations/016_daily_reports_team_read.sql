-- ============================================================
-- Day One CRM — Team members can read all daily reports
-- ============================================================

DROP POLICY IF EXISTS "daily_reports_select_own" ON public.daily_reports;
CREATE POLICY "daily_reports_select_team"
  ON public.daily_reports FOR SELECT
  USING (public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN'));
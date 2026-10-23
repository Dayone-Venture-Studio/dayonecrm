-- ============================================================
-- Day One CRM — Daily reports delete policy
-- ============================================================

DROP POLICY IF EXISTS "daily_reports_delete_own" ON public.daily_reports;
CREATE POLICY "daily_reports_delete_own"
  ON public.daily_reports FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.user_role() IN ('PROJECT_MANAGER', 'ADMIN')
  );
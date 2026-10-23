-- ============================================================
-- Day One CRM — Daily report end time (log off)
-- ============================================================

ALTER TABLE public.daily_reports
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
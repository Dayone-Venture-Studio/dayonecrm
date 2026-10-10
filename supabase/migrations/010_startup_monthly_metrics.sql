-- ============================================================
-- Monthly revenue / target metrics for the performance wall
-- Populated by hand in the Supabase SQL editor (no admin UI yet).
-- ============================================================

ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS monthly_revenue NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS monthly_target  NUMERIC(14,2);

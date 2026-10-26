-- ============================================================
-- Day One CRM — Leave requests for internal team members
-- Employees / project managers can apply for leave; project
-- managers (and admins) can approve or reject.
-- Run AFTER 018_first_login_password_change.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('FULL_DAY', 'HALF_DAY')),
  half_day_slot TEXT CHECK (half_day_slot IS NULL OR half_day_slot IN ('FIRST_HALF', 'SECOND_HALF')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reviewed_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  review_note   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leave_valid_dates CHECK (start_date <= end_date),
  CONSTRAINT leave_half_day_single_date CHECK (
    duration_type = 'FULL_DAY' OR start_date = end_date
  ),
  CONSTRAINT leave_half_day_slot_required CHECK (
    (duration_type = 'HALF_DAY' AND half_day_slot IS NOT NULL)
    OR (duration_type = 'FULL_DAY' AND half_day_slot IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS leave_requests_user_id_idx ON public.leave_requests (user_id);
CREATE INDEX IF NOT EXISTS leave_requests_status_idx ON public.leave_requests (status);
CREATE INDEX IF NOT EXISTS leave_requests_start_date_idx ON public.leave_requests (start_date);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Employees / PMs can read their own requests.
DROP POLICY IF EXISTS "leave_select_own" ON public.leave_requests;
CREATE POLICY "leave_select_own" ON public.leave_requests
  FOR SELECT USING (user_id = auth.uid());

-- Project managers (and admins) can read every team leave request.
DROP POLICY IF EXISTS "leave_select_leads" ON public.leave_requests;
CREATE POLICY "leave_select_leads" ON public.leave_requests
  FOR SELECT USING (public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'));

-- A team member can apply for their own leave.
DROP POLICY IF EXISTS "leave_insert_own" ON public.leave_requests;
CREATE POLICY "leave_insert_own" ON public.leave_requests
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER')
  );

-- Ensure CANCELLED is allowed even on databases created with the earlier
-- version of this migration.
ALTER TABLE public.leave_requests
  DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE public.leave_requests
  ADD CONSTRAINT leave_requests_status_check
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'));

-- Only project managers (and admins) can approve / reject.
DROP POLICY IF EXISTS "leave_update_leads" ON public.leave_requests;
CREATE POLICY "leave_update_leads" ON public.leave_requests
  FOR UPDATE USING (public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'))
  WITH CHECK (public.user_role() IN ('PROJECT_MANAGER', 'ADMIN'));

-- A team member can cancel their own pending request (status -> CANCELLED only).
DROP POLICY IF EXISTS "leave_cancel_own" ON public.leave_requests;
CREATE POLICY "leave_cancel_own" ON public.leave_requests
  FOR UPDATE USING (user_id = auth.uid() AND status = 'PENDING')
  WITH CHECK (user_id = auth.uid() AND status = 'CANCELLED');
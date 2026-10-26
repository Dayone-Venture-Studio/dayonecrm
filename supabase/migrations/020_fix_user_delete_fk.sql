-- ============================================================
-- Day One CRM — Allow deleting auth users with activity logs
-- activity_logs.user_id referenced auth.users without an ON DELETE
-- rule, which blocked auth.admin.deleteUser(). Cascade the logs.
-- Run AFTER 019_leave_requests.sql
-- ============================================================

ALTER TABLE public.activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE public.activity_logs
  ADD CONSTRAINT activity_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
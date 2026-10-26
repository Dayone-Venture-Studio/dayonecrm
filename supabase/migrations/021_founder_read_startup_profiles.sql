-- ============================================================
-- Day One CRM — Founders can read profiles of their startup members
-- Migration 009 removed the is_same_startup condition from
-- profiles_select, so founders could no longer see staff names.
-- Re-add it as a separate permissive policy.
-- Run AFTER 020_fix_user_delete_fk.sql
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_founder_startup" ON public.profiles;
CREATE POLICY "profiles_select_founder_startup" ON public.profiles
  FOR SELECT USING (public.is_same_startup(id));
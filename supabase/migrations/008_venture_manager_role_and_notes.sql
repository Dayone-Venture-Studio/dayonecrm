-- ============================================================
-- Add VENTURE_MANAGER role and venture_manager_notes table
-- ============================================================

-- Step 1: Add VENTURE_MANAGER to the profiles role check constraint
-- First, drop the existing constraint
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with VENTURE_MANAGER included
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'FOUNDER', 'STAFF', 'VENTURE_MANAGER'));

-- Step 2: Create venture_manager_notes table
CREATE TABLE IF NOT EXISTS public.venture_manager_notes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('STARTUP', 'TASK', 'WEEKLY_PLAN')),
  entity_id         UUID NOT NULL,
  note_text         TEXT NOT NULL,
  urgency           TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  visibility        TEXT NOT NULL DEFAULT 'ADMIN_ONLY' CHECK (visibility IN ('ADMIN_ONLY', 'SHARED_WITH_STARTUP')),
  resolved          BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_vm_notes_entity ON public.venture_manager_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vm_notes_created_by ON public.venture_manager_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_vm_notes_resolved ON public.venture_manager_notes(resolved);
CREATE INDEX IF NOT EXISTS idx_vm_notes_urgency ON public.venture_manager_notes(urgency);
CREATE INDEX IF NOT EXISTS idx_vm_notes_created_at ON public.venture_manager_notes(created_at DESC);

-- Step 4: Add trigger for auto-updating updated_at timestamp
CREATE OR REPLACE TRIGGER update_venture_manager_notes_updated_at
  BEFORE UPDATE ON public.venture_manager_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Add comments for documentation
COMMENT ON TABLE public.venture_manager_notes IS 'Stores notes and flags created by Venture Managers for oversight and feedback';
COMMENT ON COLUMN public.venture_manager_notes.entity_type IS 'Type of entity: STARTUP, TASK, or WEEKLY_PLAN';
COMMENT ON COLUMN public.venture_manager_notes.entity_id IS 'UUID of the entity (startup_id, task_id, or weekly_plan_id)';
COMMENT ON COLUMN public.venture_manager_notes.urgency IS 'Priority level: LOW, MEDIUM, HIGH, or CRITICAL';
COMMENT ON COLUMN public.venture_manager_notes.visibility IS 'Who can see this note: ADMIN_ONLY or SHARED_WITH_STARTUP';
COMMENT ON COLUMN public.venture_manager_notes.resolved IS 'Whether the concern/issue has been addressed';

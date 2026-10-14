-- Add acknowledgement tracking to venture_manager_notes
-- Migration: 012_add_note_acknowledgement.sql

-- Add acknowledgement columns
ALTER TABLE venture_manager_notes
ADD COLUMN acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN acknowledged_at TIMESTAMPTZ;

-- Add index for faster queries on acknowledged status
CREATE INDEX idx_venture_manager_notes_acknowledged 
ON venture_manager_notes(acknowledged);

-- Add index for acknowledged_by lookups
CREATE INDEX idx_venture_manager_notes_acknowledged_by 
ON venture_manager_notes(acknowledged_by);

-- Update RLS policies to allow founders to view and acknowledge notes
-- Founders can view notes for their startup
CREATE POLICY "Founders can view notes for their startup"
ON venture_manager_notes FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM startup_members 
    WHERE startup_id = (
      -- Get startup_id based on entity_type
      CASE 
        WHEN entity_type = 'STARTUP' THEN entity_id::uuid
        WHEN entity_type = 'TASK' THEN (SELECT startup_id FROM tasks WHERE id = entity_id::uuid)
        WHEN entity_type = 'WEEKLY_PLAN' THEN (SELECT startup_id FROM weekly_plans WHERE id = entity_id::uuid)
      END
    )
    AND role = 'FOUNDER'
  )
);

-- Founders can acknowledge notes (update only acknowledged fields)
CREATE POLICY "Founders can acknowledge notes for their startup"
ON venture_manager_notes FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM startup_members 
    WHERE startup_id = (
      CASE 
        WHEN entity_type = 'STARTUP' THEN entity_id::uuid
        WHEN entity_type = 'TASK' THEN (SELECT startup_id FROM tasks WHERE id = entity_id::uuid)
        WHEN entity_type = 'WEEKLY_PLAN' THEN (SELECT startup_id FROM weekly_plans WHERE id = entity_id::uuid)
      END
    )
    AND role = 'FOUNDER'
  )
)
WITH CHECK (
  -- Only allow updating acknowledgement fields
  auth.uid() IN (
    SELECT user_id 
    FROM startup_members 
    WHERE startup_id = (
      CASE 
        WHEN entity_type = 'STARTUP' THEN entity_id::uuid
        WHEN entity_type = 'TASK' THEN (SELECT startup_id FROM tasks WHERE id = entity_id::uuid)
        WHEN entity_type = 'WEEKLY_PLAN' THEN (SELECT startup_id FROM weekly_plans WHERE id = entity_id::uuid)
      END
    )
    AND role = 'FOUNDER'
  )
);

-- Add comment
COMMENT ON COLUMN venture_manager_notes.acknowledged IS 'Whether the note has been acknowledged by the founder';
COMMENT ON COLUMN venture_manager_notes.acknowledged_by IS 'User ID of the founder who acknowledged the note';
COMMENT ON COLUMN venture_manager_notes.acknowledged_at IS 'Timestamp when the note was acknowledged';

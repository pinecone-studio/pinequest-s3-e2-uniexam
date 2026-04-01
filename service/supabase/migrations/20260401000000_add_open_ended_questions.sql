-- Add question_type column to distinguish multiple_choice vs open_ended
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice';

-- Add max_points for open-ended questions grading
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS max_points INT NOT NULL DEFAULT 1;

-- Update existing rows
UPDATE questions SET question_type = 'multiple_choice' WHERE question_type IS NULL OR question_type = '';

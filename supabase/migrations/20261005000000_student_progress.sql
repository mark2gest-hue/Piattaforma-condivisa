-- Migration: Create student_progress table for tracking hours and completed lessons
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code TEXT NOT NULL,
    student_email TEXT,
    course_id TEXT NOT NULL DEFAULT 'ai-start',
    completed_lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_checkpoints JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_hours NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_exam_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    manual_unlock_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_progress UNIQUE (student_code, course_id)
);

-- Index for speedy queries by code or email
CREATE INDEX IF NOT EXISTS idx_student_progress_code ON public.student_progress(student_code);
CREATE INDEX IF NOT EXISTS idx_student_progress_email ON public.student_progress(student_email);

-- Enable RLS
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated team members (admins) have full access
DROP POLICY IF EXISTS "Authenticated users full access to student_progress" ON public.student_progress;
CREATE POLICY "Authenticated users full access to student_progress"
    ON public.student_progress
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 2: Public / anon can select progress via code
DROP POLICY IF EXISTS "Public read student_progress" ON public.student_progress;
CREATE POLICY "Public read student_progress"
    ON public.student_progress
    FOR SELECT
    TO public
    USING (true);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_student_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_progress ON public.student_progress;
CREATE TRIGGER trigger_update_student_progress
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_student_progress_updated_at();

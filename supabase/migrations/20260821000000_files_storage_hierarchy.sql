-- ==============================================================================
-- MIGRAZIONE: GESTIONE CARTELLE & FILE CONDIVISI GERARCHICI
-- ==============================================================================

-- Aggiunta colonna opzionale parent_folder_id su files per collegamenti cartella
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS parent_folder_id UUID REFERENCES public.files(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_files_parent_folder_id ON public.files(parent_folder_id);

-- Assicurazione che il bucket 'team-files' sia accessibile sia per lettura che per caricamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-files', 'team-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy per inserimento file storage per utenti autenticati
DROP POLICY IF EXISTS "Team members can upload storage files" ON storage.objects;
CREATE POLICY "Team members can upload storage files" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'team-files');

DROP POLICY IF EXISTS "Team members can view storage files" ON storage.objects;
CREATE POLICY "Team members can view storage files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'team-files');

DROP POLICY IF EXISTS "Team members can delete storage files" ON storage.objects;
CREATE POLICY "Team members can delete storage files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'team-files');

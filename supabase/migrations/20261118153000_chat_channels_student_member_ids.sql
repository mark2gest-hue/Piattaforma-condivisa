DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'chat_channels'
  ) THEN
    DROP POLICY IF EXISTS "Public channels visible to authenticated users" ON public.chat_channels;

    ALTER TABLE public.chat_channels
      ALTER COLUMN member_ids DROP DEFAULT;

    ALTER TABLE public.chat_channels
      ALTER COLUMN member_ids TYPE TEXT[] USING member_ids::text[];

    ALTER TABLE public.chat_channels
      ALTER COLUMN member_ids SET DEFAULT '{}'::text[];

    CREATE POLICY "Public channels visible to authenticated users"
      ON public.chat_channels FOR SELECT
      TO authenticated
      USING (
        is_private = false
        OR auth.uid()::text = ANY(member_ids)
        OR auth.uid() = created_by
      );
  END IF;
END $$;

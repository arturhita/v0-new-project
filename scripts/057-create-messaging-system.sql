-- 1. Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    live_consultation_id uuid NOT NULL REFERENCES public.live_consultations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (content <> ''),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Add comments to the table and columns
COMMENT ON TABLE public.messages IS 'Stores chat messages for each live consultation.';
COMMENT ON COLUMN public.messages.live_consultation_id IS 'The consultation this message belongs to.';
COMMENT ON COLUMN public.messages.sender_id IS 'The user who sent the message.';
COMMENT ON COLUMN public.messages.content IS 'The text content of the message.';

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS messages_live_consultation_id_idx ON public.messages(live_consultation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to participants" ON public.messages;
DROP POLICY IF EXISTS "Allow insert access to participants" ON public.messages;

-- 6. Create RLS policies
CREATE POLICY "Allow read access to participants"
ON public.messages
FOR SELECT
USING (
  auth.uid() IN (
    SELECT client_id FROM public.live_consultations WHERE id = live_consultation_id
  ) OR
  auth.uid() IN (
    SELECT operator_id FROM public.live_consultations WHERE id = live_consultation_id
  )
);

CREATE POLICY "Allow insert access to participants"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() IN (
      SELECT client_id FROM public.live_consultations WHERE id = live_consultation_id
    ) OR
    auth.uid() IN (
      SELECT operator_id FROM public.live_consultations WHERE id = live_consultation_id
    )
  )
);

-- 7. Enable Realtime on the messages table
-- This part is done in the Supabase Dashboard under Database > Replication,
-- but we ensure the publication includes the table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- 8. Create a helper function to get messages for a consultation
CREATE OR REPLACE FUNCTION get_consultation_messages(p_consultation_id uuid)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  sender_id uuid,
  sender_full_name text,
  sender_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is a participant of the consultation
  IF NOT (
    auth.uid() IN (SELECT client_id FROM public.live_consultations WHERE id = p_consultation_id) OR
    auth.uid() IN (SELECT operator_id FROM public.live_consultations WHERE id = p_consultation_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a participant of this consultation.';
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.created_at,
    m.sender_id,
    p.full_name AS sender_full_name,
    p.avatar_url AS sender_avatar_url
  FROM
    public.messages m
  JOIN
    public.profiles p ON m.sender_id = p.id
  WHERE
    m.live_consultation_id = p_consultation_id
  ORDER BY
    m.created_at ASC;
END;
$$;

-- Questo comando abilita la trasmissione di eventi (INSERT, UPDATE, DELETE)
-- sulla tabella 'profiles' attraverso la pubblicazione 'supabase_realtime'.
-- È un prerequisito per usare Realtime e Presence su questa tabella.

-- Prima, controlliamo se la pubblicazione esiste già per la tabella.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- Se non esiste, la aggiungiamo.
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    RAISE NOTICE 'Realtime enabled for public.profiles';
  ELSE
    RAISE NOTICE 'Realtime is already enabled for public.profiles';
  END IF;
END;
$$;

-- Questo script aggiorna la funzione che gestisce la creazione di un nuovo utente.
-- Garantisce che ogni nuovo profilo nella tabella 'profiles' venga creato
-- con una struttura 'services' JSONB di default, completa e valida.
-- Questo è fondamentale per prevenire errori 'null' in tutta l'applicazione.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce un nuovo record nella tabella 'profiles' per il nuovo utente.
  INSERT INTO public.profiles (id, full_name, role, services)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'client', -- Tutti gli utenti partono come 'client' di default.
    -- Struttura JSONB di default per i servizi.
    -- Garantisce che l'oggetto 'services' non sia mai nullo.
    '{
      "chat": {"enabled": false, "price_per_minute": 0},
      "call": {"enabled": false, "price_per_minute": 0},
      "video": {"enabled": false, "price_per_minute": 0}
    }'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa (o ri-associa) il trigger alla tabella 'users' di Supabase Auth.
-- Si attiva dopo ogni nuovo inserimento nella tabella degli utenti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

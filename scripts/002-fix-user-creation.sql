-- Disabilita temporaneamente la RLS sulla tabella profiles per permettere alla funzione di operare
-- Questo è un passaggio di sicurezza per garantire che la funzione abbia i permessi necessari.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Funzione robusta per creare un profilo per un nuovo utente.
-- Questa funzione viene eseguita ogni volta che un nuovo utente si registra in Supabase.
-- La versione precedente era probabilmente la causa degli errori di creazione manuale.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER permette alla funzione di essere eseguita con i permessi del suo creatore.
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role public.user_role;
  user_name TEXT;
  user_status public.operator_status;
BEGIN
  -- Estrae il ruolo dai metadati dell'utente. Se non è specificato, imposta 'client' come default.
  user_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'client'
  );

  -- Estrae il nome dai metadati. Se non è specificato, usa una stringa vuota.
  user_name := COALESCE(
    new.raw_user_meta_data->>'name',
    ''
  );

  -- Imposta lo stato iniziale. Se è un operatore, lo stato sarà 'pending_approval', altrimenti NULL.
  IF user_role = 'operator' THEN
    user_status := 'pending_approval';
  ELSE
    user_status := NULL;
  END IF;

  -- Inserisce la nuova riga nella tabella 'profiles' con i dati estratti.
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    new.id,
    new.email,
    user_name,
    user_role,
    user_status
  );

  -- Se il nuovo utente è un operatore, crea anche una voce di default in 'operator_details'.
  IF user_role = 'operator' THEN
    INSERT INTO public.operator_details (id, stage_name, bio)
    VALUES (new.id, user_name, 'Benvenuto/a sulla nostra piattaforma! Aggiorna la tua biografia.');
  END IF;

  RETURN new;
END;
$$;

-- Trigger per chiamare la funzione alla creazione di un nuovo utente in auth.users.
-- Rimuoviamo il vecchio trigger per sicurezza e creiamo quello nuovo e corretto.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Riabilita la RLS sulla tabella profiles una volta terminata l'operazione.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Commento per indicare il completamento dello script.
-- La funzione e il trigger per la creazione di nuovi utenti sono stati corretti.
-- Ora la creazione manuale degli utenti dalla dashboard di Supabase dovrebbe funzionare correttamente.

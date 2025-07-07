-- Questo script corregge definitivamente il problema di creazione dell'utente.
-- Inizia rimuovendo la vecchia funzione e il trigger per garantire una nuova installazione pulita.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Ora, crea la funzione corretta.
-- SECURITY DEFINER è la chiave: permette alla funzione di essere eseguita con i permessi
-- del suo proprietario (un super-amministratore), bypassando in modo sicuro il conflitto con le regole di sicurezza.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce il nuovo utente nella tabella dei profili.
  -- Se un ruolo non è specificato durante la creazione (come nella creazione manuale),
  -- assegna di default il ruolo 'client'.
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')::user_role,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Infine, ricrea il trigger che si attiva dopo la creazione di un nuovo utente in Supabase Auth
-- e chiama la nostra funzione corretta.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

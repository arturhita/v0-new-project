-- Rimuovi la vecchia funzione e il trigger per una pulizia completa
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Crea la nuova funzione, a prova di errore
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce una nuova riga, usando COALESCE per fornire valori di default
  -- se i metadati non sono presenti. Questo previene errori di null constraint.
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Nuovo Utente'), -- Default: 'Nuovo Utente'
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'client')::public.user_role -- Default: 'client'
  );
  RETURN new;
END;
$$;

-- Crea il trigger che si attiva dopo la creazione di un utente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Commento: Questa versione è più robusta perché non fallisce se i metadati
-- 'name' o 'role' non vengono passati durante la chiamata a supabase.auth.signUp().

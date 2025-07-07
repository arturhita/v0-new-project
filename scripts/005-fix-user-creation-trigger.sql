-- Rende la funzione handle_new_user più robusta, gestendo i casi in cui
-- un utente viene creato senza metadati (es. dalla dashboard di Supabase).
-- Assegna 'client' come ruolo di default se non ne viene fornito uno.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name', -- Il nome può essere nullo
    COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'client'::public.user_role -- Assegna 'client' se il ruolo non è specificato
    )
  );
  RETURN new;
END;
$$;

-- Non è necessario ricreare il trigger, stiamo solo sostituendo la funzione che esegue.
-- Il trigger 'on_auth_user_created' esistente chiamerà automaticamente questa nuova versione della funzione.

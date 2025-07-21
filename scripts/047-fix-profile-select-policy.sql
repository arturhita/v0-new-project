-- Rimuove la vecchia policy di select, che era troppo permissiva e poteva causare conflitti.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Crea una nuova policy sicura che permette agli utenti di leggere SOLO il proprio profilo.
-- Questo è fondamentale per il funzionamento del login, che deve leggere il ruolo dell'utente.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy per permettere agli admin di vedere tutti i profili.
-- Per questo, creiamo prima una funzione helper che controlla il ruolo dell'utente attuale.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ora usiamo la funzione nella policy.
CREATE POLICY "Admins can view all profiles."
ON public.profiles FOR SELECT
USING (public.is_admin());

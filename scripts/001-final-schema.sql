-- Disabilita RLS su tutte le tabelle per una pulizia sicura
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details DISABLE ROW LEVEL SECURITY;
-- ... (aggiungi altre tabelle se hanno RLS)

-- Rimuove le vecchie policy per evitare conflitti
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- Rimuove la vecchia funzione admin per sicurezza
DROP FUNCTION IF EXISTS is_admin(uuid);

-- Funzione per controllare se un utente è admin (ottimizzata per evitare ricorsione)
-- SECURITY DEFINER permette alla funzione di bypassare RLS per la sua query interna.
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
-- Imposta un search_path sicuro
SET search_path = public
AS $$
BEGIN
  -- Controlla direttamente la tabella senza innescare RLS ricorsivamente
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id AND profiles.role = 'admin'
  );
END;
$$;

-- NUOVE REGOLE DI SICUREZZA (RLS) PER LA TABELLA PROFILES

-- 1. SELECT: Gli utenti possono vedere il proprio profilo. Gli admin possono vedere tutti i profili.
CREATE POLICY "Allow individual users and admins to read profiles" ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR is_admin(auth.uid())
);

-- 2. INSERT: Gli utenti possono creare il proprio profilo.
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- 3. UPDATE: Gli utenti possono aggiornare il proprio profilo. Gli admin possono aggiornare tutti i profili.
CREATE POLICY "Allow individual users and admins to update profiles" ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = id OR is_admin(auth.uid())
);

-- 4. DELETE: Solo gli admin possono cancellare profili.
CREATE POLICY "Allow admins to delete profiles" ON public.profiles
FOR DELETE
USING (
  is_admin(auth.uid())
);


-- Abilita RLS su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;
-- ... (aggiungi altre tabelle se hanno RLS)

-- Forza RLS per il proprietario della tabella (best practice di sicurezza)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details FORCE ROW LEVEL SECURITY;
-- ... (aggiungi altre tabelle se hanno RLS)

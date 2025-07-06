-- Rimuove le vecchie policy per evitare conflitti e fare pulizia.
DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo." ON public.profiles;
DROP POLICY IF EXISTS "Gli utenti possono vedere i propri profili." ON public.profiles;
DROP POLICY IF EXISTS "Gli utenti autenticati possono leggere tutti i profili." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

DROP POLICY IF EXISTS "Qualsiasi utente può caricare un avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può aggiornare il proprio avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può vedere il proprio avatar." ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;


-- POLICY PER LA TABELLA PROFILES
-- 1. Permette a un utente di leggere il proprio profilo (per la pagina di modifica)
CREATE POLICY "Gli utenti possono leggere il proprio profilo"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 2. Permette a un utente di aggiornare SOLO il proprio profilo
CREATE POLICY "Gli utenti possono aggiornare il proprio profilo"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- 3. Permette a tutti (anche non autenticati) di leggere i profili degli operatori approvati (per le pagine pubbliche)
CREATE POLICY "I profili degli operatori approvati sono pubblici"
ON public.profiles FOR SELECT
USING ( role = 'operator' AND status = 'approved' );


-- POLICY PER LO STORAGE 'avatars'
-- 1. Permette a tutti di vedere gli avatar (le immagini sono pubbliche)
CREATE POLICY "Gli avatar sono visibili pubblicamente"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Permette a un utente autenticato di caricare un avatar NELLA PROPRIA CARTELLA
-- La cartella deve avere il nome del suo user_id (es. /avatars/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/avatar.png)
CREATE POLICY "Un utente può caricare il proprio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- 3. Permette a un utente autenticato di aggiornare il proprio avatar
CREATE POLICY "Un utente può aggiornare il proprio avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = (storage.foldername(name))[1]::uuid )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- 4. Permette a un utente autenticato di cancellare il proprio avatar
CREATE POLICY "Un utente può cancellare il proprio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = (storage.foldername(name))[1]::uuid );

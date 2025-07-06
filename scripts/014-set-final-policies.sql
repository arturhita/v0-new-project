-- SCRIPT 2: IMPOSTA LE REGOLE DI SICUREZZA
-- Esegui questo script DOPO che il primo ha funzionato senza errori.

-- Pulisci tutte le vecchie policy per evitare conflitti.
DROP POLICY IF EXISTS "policy_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "policy_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "policy_select_public_operators" ON public.profiles;
-- Drop any other old policies that might exist from previous attempts
DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo." ON public.profiles;
DROP POLICY IF EXISTS "I profili degli operatori approvati sono pubblici" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;


-- Crea le nuove policy corrette per la tabella PROFILES
-- 1. Gli utenti possono leggere il proprio profilo.
CREATE POLICY "policy_select_own_profile" ON public.profiles
FOR SELECT USING ( auth.uid() = id );

-- 2. Gli utenti possono modificare il proprio profilo.
CREATE POLICY "policy_update_own_profile" ON public.profiles
FOR UPDATE USING ( auth.uid() = id ) WITH CHECK ( auth.uid() = id );

-- 3. Chiunque (anche non loggato) può vedere gli operatori APPROVATI.
CREATE POLICY "policy_select_public_operators" ON public.profiles
FOR SELECT USING ( role = 'operator' AND status = 'approved' );


-- Pulisci le vecchie policy per lo STORAGE
DROP POLICY IF EXISTS "policy_select_public_avatars" ON storage.objects;
DROP POLICY IF EXISTS "policy_insert_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "policy_update_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "policy_delete_own_avatar" ON storage.objects;
-- Drop any other old policies
DROP POLICY IF EXISTS "Qualsiasi utente può caricare un avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può aggiornare il proprio avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può caricare il proprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Un utente può cancellare il proprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Gli avatar sono visibili pubblicamente" ON storage.objects;


-- Crea le nuove policy corrette per lo STORAGE (avatars)
-- 1. Gli avatar sono visibili pubblicamente.
CREATE POLICY "policy_select_public_avatars" ON storage.objects
FOR SELECT USING ( bucket_id = 'avatars' );

-- 2. Un utente autenticato può caricare un avatar nella sua cartella personale (il cui nome è il suo user_id).
CREATE POLICY "policy_insert_own_avatar" ON storage.objects
FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- 3. Un utente può aggiornare/sovrascrivere il proprio avatar.
CREATE POLICY "policy_update_own_avatar" ON storage.objects
FOR UPDATE TO authenticated USING ( auth.uid() = (storage.foldername(name))[1]::uuid );

-- 4. Un utente può cancellare il proprio avatar.
CREATE POLICY "policy_delete_own_avatar" ON storage.objects
FOR DELETE TO authenticated USING ( auth.uid() = (storage.foldername(name))[1]::uuid );

SELECT 'Step 2 completato: Tutte le policy di sicurezza sono state impostate correttamente.' as result;

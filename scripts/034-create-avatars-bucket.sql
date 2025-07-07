-- =================================================================
-- SCRIPT PER LA CREAZIONE DEL BUCKET 'avatars'
-- Versione: 1.2
-- Obiettivo: Assicurarsi che il bucket per gli avatar esista e sia
--            pubblicamente accessibile in lettura.
-- Sicurezza: Eseguibile più volte senza errori.
-- =================================================================

-- 1. Inserisce il bucket 'avatars' se non esiste già.
--    Rendendolo pubblico, chiunque con il link può vedere le immagini.
--    Imposta anche limiti di dimensione e tipi di file per sicurezza.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, '{"image/jpeg", "image/png", "image/webp", "image/gif"}')
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = '{"image/jpeg", "image/png", "image/webp", "image/gif"}';

-- 2. Pulisce le vecchie policy per evitare conflitti durante la riesecuzione
DROP POLICY IF EXISTS "PublicReadAccess" ON storage.objects;
DROP POLICY IF EXISTS "AuthenticatedInsert" ON storage.objects;

-- 3. Crea una policy di selezione (lettura) permissiva per tutti.
--    Questo è necessario affinché i link pubblici delle immagini funzionino.
CREATE POLICY "PublicReadAccess" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 4. Crea una policy di inserimento (scrittura) per gli utenti autenticati.
--    L'upload avverrà tramite signed URL generati dal backend (con service_role),
--    quindi questa policy agisce come un ulteriore livello di sicurezza.
CREATE POLICY "AuthenticatedInsert" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Notifica di completamento
SELECT 'Script 034-create-avatars-bucket.sql eseguito con successo.' as result;

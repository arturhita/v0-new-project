-- Crea o sostituisce la funzione per garantire che sia sempre aggiornata.
CREATE OR REPLACE FUNCTION public.get_my_profile()
-- Definisce la struttura dei dati che la funzione restituirà (corrisponde al nostro tipo Profile)
RETURNS TABLE (
    id uuid,
    full_name text,
    avatar_url text,
    role public.user_role
)
LANGUAGE sql
-- SECURITY DEFINER: La parte più importante. Esegue la funzione con i permessi del creatore (admin),
-- bypassando le policy RLS del chiamante, ma usando auth.uid() per la sicurezza.
SECURITY DEFINER
-- Imposta il percorso di ricerca per evitare problemi con gli schemi.
SET search_path = public
AS $$
    -- La logica della funzione: seleziona il profilo dove l'ID corrisponde
    -- all'ID dell'utente attualmente autenticato che ha chiamato la funzione.
    SELECT
        p.id,
        p.full_name,
        p.avatar_url,
        p.role
    FROM
        public.profiles AS p
    WHERE
        p.id = auth.uid();
$$;

-- Concede il permesso di ESEGUIRE questa funzione a tutti gli utenti autenticati.
-- Senza questo, nessuno potrebbe chiamarla.
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

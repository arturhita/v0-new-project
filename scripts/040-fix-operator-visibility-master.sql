-- Sicurezza: Rimuoviamo le versioni precedenti e potenzialmente difettose delle funzioni
-- per garantire una installazione pulita. L'uso di IF EXISTS evita errori se non esistono.
DROP FUNCTION IF EXISTS get_operators_by_category_case_insensitive(text);
DROP FUNCTION IF EXISTS get_operators_for_admin_list();
DROP FUNCTION IF EXISTS get_featured_operators_public();

-- =================================================================
-- Funzione per le Pagine di Categoria (es. /esperti/cartomanzia)
-- Risolve: "Could not find the function..."
-- =================================================================
CREATE OR REPLACE FUNCTION get_operators_by_category_case_insensitive(category_slug text)
RETURNS SETOF profiles -- Restituisce l'intera riga della tabella 'profiles' per la massima compatibilità
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.profiles p
    WHERE
        p.role = 'operator'
        AND p.status = 'Attivo'
        -- Controlla se l'array 'categories' del profilo contiene lo slug della categoria fornito.
        -- La funzione unaccent permette la ricerca anche senza accenti (es. 'medianita' trova 'Medianità').
        AND EXISTS (
            SELECT 1
            FROM unnest(p.categories) AS cat
            WHERE unaccent(lower(cat)) = unaccent(lower(category_slug))
        );
END;
$$;

-- =================================================================
-- Funzione per il Pannello di Amministrazione (Elenco Operatori)
-- Risolve: "structure of query does not match..." e "column profiles.email does not exist"
-- =================================================================
CREATE OR REPLACE FUNCTION get_operators_for_admin_list()
RETURNS TABLE (
    id uuid,
    full_name text,
    stage_name text,
    email text,
    status text,
    commission_rate real,
    created_at timestamptz,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER -- Permette alla funzione di accedere a tabelle protette come auth.users
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.stage_name,
        u.email, -- Prende l'email dalla tabella auth.users, risolvendo l'errore
        p.status,
        p.commission_rate,
        p.created_at,
        p.avatar_url
    FROM
        public.profiles p
    LEFT JOIN
        auth.users u ON p.id = u.id -- Usiamo LEFT JOIN per sicurezza
    WHERE
        p.role = 'operator'
    ORDER BY
        p.created_at DESC;
END;
$$;

-- =================================================================
-- Funzione per la Homepage (Operatori in primo piano)
-- Risolve: Invisibilità degli operatori in homepage
-- =================================================================
CREATE OR REPLACE FUNCTION get_featured_operators_public()
RETURNS SETOF profiles
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.profiles
    WHERE
        role = 'operator'
        AND status = 'Attivo'
    ORDER BY
        is_online DESC, -- Prima gli operatori online
        average_rating DESC NULLS LAST, -- Poi per valutazione
        created_at DESC
    LIMIT 8; -- Limita ai primi 8
END;
$$;

-- =================================================================
-- PARTE 1: RIMOZIONE DELLE POLICY E FUNZIONI DIFETTOSE
-- Facciamo pulizia completa per evitare qualsiasi conflitto.
-- =================================================================

-- Rimuoviamo le policy dalla tabella profiles.
DROP POLICY IF EXISTS "Public can view active operator profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;

-- Rimuoviamo le funzioni di lettura dati per ricrearle correttamente.
DROP FUNCTION IF EXISTS get_operators_by_category_case_insensitive(text);
DROP FUNCTION IF EXISTS get_operators_for_admin_list();
DROP FUNCTION IF EXISTS get_featured_operators_public();
DROP FUNCTION IF EXISTS get_current_user_role();


-- =================================================================
-- PARTE 2: CREAZIONE DELLA FUNZIONE HELPER DI SICUREZZA
-- Questa è la chiave per rompere il loop di ricorsione.
-- =================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER -- Eseguita con i permessi del creatore, bypassa la RLS per questa singola query.
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- =================================================================
-- PARTE 3: RICOSTRUZIONE DELLE POLICY DI SICUREZZA (RLS)
-- Ora le policy sono sicure e non ricorsive.
-- =================================================================

-- Assicuriamoci che la RLS sia attiva.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Chiunque può VEDERE i profili degli operatori ATTIVI.
CREATE POLICY "Public can view active operator profiles."
ON public.profiles FOR SELECT
USING (role = 'operator' AND status = 'Attivo');

-- Policy 2: Un utente loggato può fare TUTTO sul proprio profilo.
CREATE POLICY "Users can manage their own profile."
ON public.profiles FOR ALL
USING (auth.uid() = id);

-- Policy 3 (CORRETTA): Un admin può fare TUTTO su TUTTI i profili,
-- usando la funzione helper che non causa ricorsione.
CREATE POLICY "Admins can manage all profiles."
ON public.profiles FOR ALL
USING (public.get_current_user_role() = 'admin');


-- =================================================================
-- PARTE 4: RICOSTRUZIONE DELLE FUNZIONI DI LETTURA DATI
-- Le ricreiamo per essere sicuri che siano allineate con le nuove policy.
-- =================================================================

-- Funzione per le Pagine di Categoria
CREATE OR REPLACE FUNCTION get_operators_by_category_case_insensitive(category_slug text)
RETURNS SETOF profiles
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.profiles p
    WHERE
        p.role = 'operator'
        AND p.status = 'Attivo'
        AND EXISTS (
            SELECT 1
            FROM unnest(p.categories) AS cat
            WHERE unaccent(lower(cat)) = unaccent(lower(category_slug))
        );
END;
$$;

-- Funzione per il Pannello di Amministrazione
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
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.stage_name,
        u.email,
        p.status,
        p.commission_rate,
        p.created_at,
        p.avatar_url
    FROM
        public.profiles p
    LEFT JOIN
        auth.users u ON p.id = u.id
    WHERE
        p.role = 'operator'
    ORDER BY
        p.created_at DESC;
END;
$$;

-- Funzione per la Homepage
CREATE OR REPLACE FUNCTION get_featured_operators_public()
RETURNS SETOF profiles
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.profiles
    WHERE
        role = 'operator'
        AND status = 'Attivo'
    ORDER BY
        is_online DESC,
        average_rating DESC NULLS LAST,
        created_at DESC
    LIMIT 8;
END;
$$;

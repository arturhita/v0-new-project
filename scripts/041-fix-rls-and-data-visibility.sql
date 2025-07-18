-- =================================================================
-- PARTE 1: RIPARAZIONE DELLA SICUREZZA (ROW LEVEL SECURITY)
-- Questa è la causa più probabile del problema.
-- =================================================================

-- Assicuriamoci che la RLS sia attiva sulla tabella dei profili.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rimuoviamo eventuali policy vecchie e potenzialmente errate per fare pulizia.
DROP POLICY IF EXISTS "Public can view active operator profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;

-- CREIAMO LE POLICY CORRETTE:

-- Policy 1 (La più importante): Permette a chiunque (anche visitatori non loggati)
-- di VEDERE i profili degli operatori che sono marcati come "Attivo".
CREATE POLICY "Public can view active operator profiles."
ON public.profiles FOR SELECT
USING (role = 'operator' AND status = 'Attivo');

-- Policy 2: Permette a un utente loggato di vedere e modificare il PROPRIO profilo.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR ALL
USING (auth.uid() = id);

-- Policy 3: Permette a un utente con ruolo 'admin' di fare qualsiasi cosa su qualsiasi profilo.
-- Nota: Questo richiede una funzione per verificare il ruolo dell'admin.
CREATE POLICY "Admins can manage all profiles."
ON public.profiles FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- =================================================================
-- PARTE 2: RICOSTRUZIONE DELLE FUNZIONI DI LETTURA DATI
-- Ricreiamo le funzioni per essere sicuri che siano perfette.
-- =================================================================

-- Sicurezza: Rimuoviamo le versioni precedenti per evitare conflitti.
DROP FUNCTION IF EXISTS get_operators_by_category_case_insensitive(text);
DROP FUNCTION IF EXISTS get_operators_for_admin_list();
DROP FUNCTION IF EXISTS get_featured_operators_public();

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

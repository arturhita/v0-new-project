-- Rimuove le vecchie versioni delle funzioni e dei tipi per garantire una nuova installazione pulita.
-- L'uso di "IF EXISTS" previene errori se gli oggetti non esistono.
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 1: Definizione dei Tipi Personalizzati (ENUMs)
-- L'uso di ENUM garantisce che i ruoli e gli stati possano avere solo i valori specificati,
-- migliorando l'integrità dei dati.

-- Tipo per i ruoli utente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
END$$;

-- Tipo per lo stato di un operatore
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status') THEN
        CREATE TYPE public.operator_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');
    END IF;
END$$;


-- STEP 2: Creazione della Tabella PROFILES
-- Questa tabella estende la tabella `auth.users` di Supabase, aggiungendo dati specifici dell'applicazione
-- come il ruolo e lo stato.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'client',
    status public.operator_status, -- Usato solo se role = 'operator'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Stores public-facing profile information for each user.';


-- STEP 3: Creazione della Tabella OPERATOR_DETAILS
-- Contiene informazioni specifiche solo per gli operatori.
CREATE TABLE IF NOT EXISTS public.operator_details (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_name TEXT,
    bio TEXT,
    specialties TEXT[],
    commission_rate NUMERIC(5, 2) DEFAULT 15.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.operator_details IS 'Stores detailed information specific to operators.';


-- STEP 4: Funzione Trigger per la Creazione di Nuovi Utenti
-- Questa funzione viene eseguita automaticamente ogni volta che un nuovo utente si registra.
-- Popola la tabella `profiles` e, se l'utente è un operatore, anche `operator_details`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Inserisce il nuovo utente nella tabella profiles
    INSERT INTO public.profiles (id, name, email, role, avatar_url, status)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        (new.raw_user_meta_data->>'role')::public.user_role,
        new.raw_user_meta_data->>'avatar_url',
        -- Imposta lo stato iniziale per gli operatori
        CASE
            WHEN (new.raw_user_meta_data->>'role')::public.user_role = 'operator' THEN 'pending_approval'::public.operator_status
            ELSE NULL
        END
    );

    -- Se il nuovo utente è un operatore, crea anche i dettagli operatore
    IF (new.raw_user_meta_data->>'role')::public.user_role = 'operator' THEN
        INSERT INTO public.operator_details (id, stage_name)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'stage_name'
        );
    END IF;

    RETURN new;
END;
$$;

-- STEP 5: Creazione del Trigger
-- Collega la funzione `handle_new_user` alla tabella `auth.users`.
-- Si attiva DOPO ogni inserimento di un nuovo utente.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- STEP 6: Abilitazione della Row Level Security (RLS)
-- Fondamentale per la sicurezza: per impostazione predefinita, nessuno può accedere ai dati.
-- Le policy successive definiranno le eccezioni.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;

-- STEP 7: Creazione delle Policy RLS
-- Definiscono chi può fare cosa.

-- Policy per PROFILES
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
CREATE POLICY "Admins can manage all profiles."
ON public.profiles FOR ALL
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Policy per OPERATOR_DETAILS
DROP POLICY IF EXISTS "Operators can view their own details." ON public.operator_details;
CREATE POLICY "Operators can view their own details."
ON public.operator_details FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Operators can update their own details." ON public.operator_details;
CREATE POLICY "Operators can update their own details."
ON public.operator_details FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all operator details." ON public.operator_details;
CREATE POLICY "Admins can manage all operator details."
ON public.operator_details FOR ALL
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Authenticated users can view operator details." ON public.operator_details;
CREATE POLICY "Authenticated users can view operator details."
ON public.operator_details FOR SELECT
USING (auth.role() = 'authenticated');


-- Sincronizza gli utenti esistenti in auth.users che non hanno un profilo
INSERT INTO public.profiles (id, name, email, role, avatar_url, status)
SELECT
    u.id,
    u.raw_user_meta_data->>'name',
    u.email,
    COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'client'),
    u.raw_user_meta_data->>'avatar_url',
    CASE
        WHEN COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'client') = 'operator' THEN 'pending_approval'::public.operator_status
        ELSE NULL
    END
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Sincronizza i dettagli per gli operatori esistenti che non li hanno
INSERT INTO public.operator_details (id, stage_name)
SELECT
    p.id,
    p.name -- Usa il nome del profilo come fallback per il nome d'arte
FROM public.profiles p
LEFT JOIN public.operator_details od ON p.id = od.id
WHERE p.role = 'operator' AND od.id IS NULL;

-- Creazione utente admin se non esiste
-- Questo blocco è sicuro da eseguire più volte.
DO $$
DECLARE
    admin_email TEXT := 'pagamenticonsulenza@gmail.com';
    admin_pass TEXT := '@Annaadmin2025@#';
    admin_user_id UUID;
BEGIN
    -- Controlla se l'utente esiste già in auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    IF admin_user_id IS NULL THEN
        -- Se non esiste, lo crea
        admin_user_id := extensions.uuid_generate_v4();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, instance_id, aud)
        VALUES (admin_user_id, admin_email, crypt(admin_pass, gen_salt('bf')), now(), '00000000-0000-0000-0000-000000000000', 'authenticated');

        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (extensions.uuid_generate_v4(), admin_user_id, format('{"sub":"%s","email":"%s"}', admin_user_id, admin_email)::jsonb, 'email', now(), now(), now());
    END IF;

    -- Assicura che il profilo esista e abbia il ruolo di admin
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (admin_user_id, admin_email, 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        name = 'Admin';
END $$;

-- STEP 1: Pulizia e Ricreazione dei Tipi (ENUMs)
-- Questo approccio "DROP and CREATE" è il più pulito per evitare errori transazionali.
-- L'opzione CASCADE rimuove e ricrea correttamente le dipendenze (es. colonne delle tabelle).
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');

DROP TYPE IF EXISTS public.operator_status CASCADE;
CREATE TYPE public.operator_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');


-- STEP 2: Creazione della Tabella PROFILES
-- Ricrea la tabella per assicurarsi che usi i nuovi tipi ENUM.
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
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
DROP TABLE IF EXISTS public.operator_details CASCADE;
CREATE TABLE public.operator_details (
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
-- Rimuove il vecchio trigger se esiste e crea quello nuovo.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- STEP 6: Abilitazione della Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;

-- STEP 7: Creazione delle Policy RLS

-- Policy per PROFILES
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' ) WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Authenticated users can view all profiles." ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');


-- Policy per OPERATOR_DETAILS
CREATE POLICY "Operators can view their own details." ON public.operator_details FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Operators can update their own details." ON public.operator_details FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all operator details." ON public.operator_details FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' ) WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Authenticated users can view operator details." ON public.operator_details FOR SELECT USING (auth.role() = 'authenticated');


-- STEP 8: Sincronizzazione e Creazione Utente Admin

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
DO $$
DECLARE
    admin_email TEXT := 'pagamenticonsulenza@gmail.com';
    admin_pass TEXT := '@Annaadmin2025@#';
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    IF admin_user_id IS NULL THEN
        admin_user_id := extensions.uuid_generate_v4();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, instance_id, aud)
        VALUES (admin_user_id, admin_email, crypt(admin_pass, gen_salt('bf')), now(), '00000000-0000-0000-0000-000000000000', 'authenticated');

        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (extensions.uuid_generate_v4(), admin_user_id, format('{"sub":"%s","email":"%s"}', admin_user_id, admin_email)::jsonb, 'email', now(), now(), now());
    END IF;

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (admin_user_id, admin_email, 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        name = 'Admin';
END $$;

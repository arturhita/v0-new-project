-- 🌑 MOONTHIR - MASTER SCHEMA V3.0 - DEFINITIVO E CORRETTO 🌑
-- Questo script unico pulisce, crea, corregge il trigger, sincronizza e popola il database.

-- =================================================================
-- FASE 1: PULIZIA COMPLETA
-- =================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_users_and_profiles();
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.consultations;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.consultation_status;
DROP TYPE IF EXISTS public.transaction_type;


-- =================================================================
-- FASE 2: CREAZIONE DEI TIPI ENUM
-- =================================================================
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.service_type AS ENUM ('chat', 'call', 'written');
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'refunded');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'consultation_payment', 'payout', 'refund');


-- =================================================================
-- FASE 3: CREAZIONE DELLA TABELLA PROFILES (CON COLONNA EMAIL)
-- =================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    email TEXT, -- Aggiunta per coerenza e facilità d'uso
    avatar_url TEXT,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    headline TEXT,
    bio TEXT,
    specializations TEXT[],
    is_online BOOLEAN NOT NULL DEFAULT false,
    online_status TEXT,
    application_status application_status NOT NULL DEFAULT 'pending',
    is_visible BOOLEAN NOT NULL DEFAULT false,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    fiscal_code TEXT,
    vat_number TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- =================================================================
-- FASE 4: CREAZIONE DELLE ALTRE TABELLE
-- =================================================================
CREATE TABLE public.services (
    id SERIAL PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2),
    price_per_consultation NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(operator_id, type)
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ... (le altre tabelle rimangono invariate)
CREATE TABLE public.consultations (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES public.services(id),
    status consultation_status NOT NULL DEFAULT 'requested',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT,
    total_cost NUMERIC(10, 2),
    operator_earning NUMERIC(10, 2),
    platform_fee NUMERIC(10, 2),
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id INT UNIQUE REFERENCES public.consultations(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    consultation_id INT REFERENCES public.consultations(id),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- =================================================================
-- FASE 5: TRIGGER CORRETTO E ROBUSTO
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- FASE 6: SINCRONIZZAZIONE DEGLI UTENTI ESISTENTI
-- =================================================================
CREATE OR REPLACE FUNCTION public.sync_users_and_profiles()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'avatar_url'
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
END;
$$;

-- Esegue la funzione di sync una volta per sistemare i dati esistenti.
SELECT public.sync_users_and_profiles();


-- =================================================================
-- FASE 7: POPOLAMENTO AUTOMATICO DEGLI OPERATORI DI ESEMPIO
-- =================================================================
DO $$
DECLARE
    operator_1_email TEXT := 'operator1@example.com';
    operator_2_email TEXT := 'operator2@example.com';
    operator_1_id UUID;
    operator_2_id UUID;
BEGIN
    -- Trova gli ID degli utenti basandosi sulle loro email
    SELECT id INTO operator_1_id FROM auth.users WHERE email = operator_1_email;
    SELECT id INTO operator_2_id FROM auth.users WHERE email = operator_2_email;

    -- Se l'utente operatore 1 esiste, lo promuove e aggiunge i servizi
    IF operator_1_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            role = 'operator',
            full_name = 'Elara Luminosa',
            headline = 'Guida Stellare per Anima e Cuore',
            bio = 'Con decenni di esperienza nella lettura dei tarocchi e nell''astrologia, offro una guida chiara e compassionevole.',
            specializations = '{"tarocchi", "astrologia", "amore"}',
            application_status = 'approved',
            is_visible = true,
            commission_rate = 25.00,
            avatar_url = '/placeholder.svg?height=128&width=128'
        WHERE id = operator_1_id;

        INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
        VALUES (operator_1_id, 'call', 1.50, true), (operator_1_id, 'chat', 1.20, true)
        ON CONFLICT (operator_id, type) DO NOTHING;
    END IF;

    -- Se l'utente operatore 2 esiste, lo promuove e aggiunge i servizi
    IF operator_2_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            role = 'operator',
            full_name = 'Orion Saggio',
            headline = 'Interprete dei Sogni e dei Numeri',
            bio = 'La numerologia e l''interpretazione dei sogni sono le mie passioni. Ti aiuto a decodificare i simboli.',
            specializations = '{"numerologia", "sogni", "lavoro"}',
            application_status = 'approved',
            is_visible = true,
            commission_rate = 20.00,
            avatar_url = '/placeholder.svg?height=128&width=128'
        WHERE id = operator_2_id;

        INSERT INTO public.services (operator_id, type, price_per_consultation, is_active)
        VALUES (operator_2_id, 'written', 25.00, true)
        ON CONFLICT (operator_id, type) DO NOTHING;
        INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
        VALUES (operator_2_id, 'call', 1.80, true)
        ON CONFLICT (operator_id, type) DO NOTHING;
    END IF;
END $$;

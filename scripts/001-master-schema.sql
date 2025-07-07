-- =================================================================
--  MASTER SCHEMA SCRIPT V1
--  Questo script resetta e ricrea l'intero schema.
--  È progettato per essere eseguito su un database vuoto o
--  per resettare completamente uno schema esistente.
-- =================================================================

-- 1. DROP OGGETTI ESISTENTI (in ordine inverso di dipendenza)
-- Questo assicura che il reset sia pulito se eseguito più volte.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.written_consultations CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.consultation_status CASCADE;

-- 2. CREAZIONE TIPI ENUM
-- Definisce i ruoli e gli stati possibili, garantendo coerenza.
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.consultation_status AS ENUM ('pending', 'answered', 'rejected', 'in_progress');

-- 3. TABELLA PROFILES
-- Estende auth.users con dati pubblici e specifici dell'applicazione.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    role public.user_role NOT NULL DEFAULT 'client'::user_role,
    full_name text,
    stage_name text UNIQUE, -- Nome d'arte per gli operatori
    avatar_url text,
    bio text,
    specialties text[],
    is_online boolean DEFAULT false,
    is_available boolean DEFAULT true,
    wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00,
    operator_rate_per_minute jsonb, -- Es: {"chat": 2.5, "call": 3.5}
    status text DEFAULT 'pending'::text -- Per approvazione operatore: pending, active, rejected
);
COMMENT ON TABLE public.profiles IS 'Dati pubblici e di ruolo per tutti gli utenti.';

-- 4. ROW LEVEL SECURITY (RLS) PER PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. FUNZIONE E TRIGGER PER GESTIRE NUOVI UTENTI
-- Crea automaticamente un profilo quando un nuovo utente si registra in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. TABELLE DI CONTENUTO (BLOG/ASTROMAG)
CREATE TABLE public.categories (
    id bigserial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE
);

CREATE TABLE public.articles (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text,
    image_url text,
    author_id uuid REFERENCES public.profiles(id),
    category_id bigint REFERENCES public.categories(id),
    created_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone
);

-- 7. TABELLE DI INTERAZIONE
CREATE TABLE public.written_consultations (
    id bigserial PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid REFERENCES public.profiles(id),
    question text NOT NULL,
    answer text,
    status public.consultation_status NOT NULL DEFAULT 'pending'::consultation_status,
    created_at timestamp with time zone DEFAULT now(),
    answered_at timestamp with time zone
);

CREATE TABLE public.reviews (
    id bigserial PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    consultation_id bigint,
    rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. SEEDING DATI ESSENZIALI
INSERT INTO public.categories (name, slug) VALUES
('Cartomanzia', 'cartomanzia'),
('Astrologia', 'astrologia'),
('Spiritualità', 'spiritualita'),
('Sogni', 'sogni')
ON CONFLICT (slug) DO NOTHING;

-- Fine dello script

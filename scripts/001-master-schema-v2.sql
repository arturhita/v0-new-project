-- =================================================================
-- COMPLETE MASTER SCHEMA SCRIPT (v2)
-- Descrizione: Resetta e ricrea l'intero schema dell'applicazione,
-- includendo tutte le tabelle dipendenti.
-- =================================================================

-- Fase 1: Pulizia Completa con CASCADE
-- Questa è la correzione chiave: usiamo CASCADE per risolvere gli errori di dipendenza.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.approve_operator_application(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_operator_application(uuid);

-- Drop delle tabelle in ordine, usando CASCADE per sicurezza.
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.written_consultations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_applications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop dei tipi personalizzati
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.consultation_status;

-- Fase 2: Creazione dei Tipi Enumerati
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.consultation_status AS ENUM ('pending', 'answered', 'closed');

-- Fase 3: Creazione della Tabella Profili (Tabella Centrale)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  role user_role NOT NULL DEFAULT 'client',
  wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stage_name VARCHAR(255),
  bio TEXT,
  specializations TEXT[],
  profile_image_url VARCHAR(255),
  hourly_rate NUMERIC(10, 2),
  is_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Dati pubblici e di ruolo per tutti gli utenti.';

-- Fase 4: Funzione e Trigger per la Creazione Automatica del Profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fase 5: Creazione delle Tabelle Dipendenti
-- 5.1 Candidature Operatori
CREATE TABLE public.operator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  phone VARCHAR(50) NOT NULL,
  bio TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  cv_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX unique_pending_application_idx ON public.operator_applications (user_id) WHERE (status = 'pending');

-- 5.2 Categorie e Articoli (Astromag)
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.3 Consulenze Scritte
CREATE TABLE public.written_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  status consultation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

-- 5.4 Recensioni
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fase 6: Funzioni del Database per la Logica di Approvazione
CREATE OR REPLACE FUNCTION public.approve_operator_application(p_application_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.operator_applications SET status = 'approved', updated_at = NOW() WHERE id = p_application_id;
  UPDATE public.profiles SET role = 'operator', updated_at = NOW() WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_operator_application(p_application_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.operator_applications SET status = 'rejected', updated_at = NOW() WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fase 7: Abilitazione della Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli utenti possono vedere tutti i profili" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gli utenti possono aggiornare il proprio profilo" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli utenti possono gestire la propria candidatura" ON public.operator_applications FOR ALL USING (auth.uid() = user_id);

-- Fine dello script.

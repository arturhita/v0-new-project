-- =================================================================
-- FASE 1: PULIZIA COMPLETA (CON CASCADE)
-- =================================================================
-- L'opzione CASCADE rimuove automaticamente tutti gli oggetti dipendenti (come chiavi esterne).
-- Questo risolve gli errori di dipendenza durante la pulizia.
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Anche per i tipi, usiamo CASCADE per sicurezza.
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.service_type CASCADE;
DROP TYPE IF EXISTS public.consultation_status CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;

-- Le funzioni e i trigger non hanno dipendenze inverse in questo modo, ma è buona norma essere espliciti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_profiles_from_auth();


-- =================================================================
-- FASE 2: CREAZIONE DEI TIPI ENUM
-- =================================================================
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.service_type AS ENUM ('call', 'chat', 'video', 'written');
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'rejected');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'consultation_fee', 'payout', 'refund');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');


-- =================================================================
-- FASE 3: CREAZIONE DELLE TABELLE
-- =================================================================
-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    operator_bio TEXT,
    operator_specialization TEXT[],
    is_available BOOLEAN DEFAULT false,
    phone_number TEXT
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';

-- Services Table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(operator_id, type)
);
COMMENT ON TABLE public.services IS 'Defines the services offered by operators.';

-- Consultations Table
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id),
    status consultation_status NOT NULL DEFAULT 'requested',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT,
    total_cost NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.consultations IS 'Tracks consultation sessions between clients and operators.';

-- Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL, -- ON DELETE SET NULL
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.reviews IS 'Stores client reviews for operators.';

-- Transactions Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id),
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.transactions IS 'Records all financial transactions.';


-- =================================================================
-- FASE 4: ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view operator profiles." ON public.profiles FOR SELECT USING (role = 'operator');

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services." ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING (auth.uid() = operator_id);

-- Add more RLS policies for other tables as needed.


-- =================================================================
-- FASE 5: AUTOMAZIONE (TRIGGER PER NUOVI UTENTI)
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- FASE 6: SINCRONIZZAZIONE UNA TANTUM (PER UTENTI ESISTENTI)
-- =================================================================
CREATE OR REPLACE FUNCTION public.sync_profiles_from_auth()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  SELECT
    u.id,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'avatar_url'
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
END;
$$;

-- Esegue la funzione di sync una volta per sistemare i dati esistenti.
SELECT public.sync_profiles_from_auth();


-- =================================================================
-- FASE 7: POPOLAMENTO DATI DI ESEMPIO
-- =================================================================
DO $$
DECLARE
  operator_1_id UUID;
  operator_2_id UUID;
BEGIN
  -- Find the UUIDs of the test operators by their email.
  SELECT id INTO operator_1_id FROM auth.users WHERE email = 'operator1@example.com';
  SELECT id INTO operator_2_id FROM auth.users WHERE email = 'operator2@example.com';

  -- Only proceed if the operators were found.
  IF operator_1_id IS NOT NULL THEN
    -- Promote operator 1 and add their services.
    UPDATE public.profiles
    SET
      role = 'operator',
      operator_bio = 'Esperta cartomante con oltre 20 anni di esperienza nella lettura dei Tarocchi di Marsiglia. Offro letture chiare e dirette per guidarti nelle tue scelte di vita.',
      operator_specialization = ARRAY['Cartomanzia', 'Tarocchi'],
      is_available = true
    WHERE id = operator_1_id;

    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES
      (operator_1_id, 'call', 1.50, true),
      (operator_1_id, 'chat', 1.20, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;
  END IF;

  IF operator_2_id IS NOT NULL THEN
    -- Promote operator 2 and add their services.
    UPDATE public.profiles
    SET
      role = 'operator',
      operator_bio = 'Astrologo e numerologo, specializzato in carte natali e affinità di coppia. Ti aiuto a comprendere il tuo percorso attraverso la saggezza delle stelle e dei numeri.',
      operator_specialization = ARRAY['Astrologia', 'Numerologia'],
      is_available = false
    WHERE id = operator_2_id;

    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES
      (operator_2_id, 'call', 1.80, true);
      
    -- Per i servizi a consulto, usiamo un prezzo fisso e non al minuto
    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES
      (operator_2_id, 'written', 25.00, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;
  END IF;
END $$;

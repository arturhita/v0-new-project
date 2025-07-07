-- 1. CLEANUP: Drop existing objects to ensure a clean slate.
-- We use 'IF EXISTS' to avoid errors if the objects don't exist.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_profiles_from_auth();
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.consultations;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.consultation_status;
DROP TYPE IF EXISTS public.transaction_type;
DROP TYPE IF EXISTS public.transaction_status;

-- 2. SETUP: Create custom types (ENUMs).
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.service_type AS ENUM ('call', 'chat', 'video', 'written');
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'rejected');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'consultation_fee', 'payout', 'refund');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

-- 3. CREATE TABLES: Define the database structure.
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

-- Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID, -- Can be null for general reviews
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.reviews IS 'Stores client reviews for operators.';

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

-- 4. ROW LEVEL SECURITY (RLS): Secure the data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view operator profiles." ON public.profiles FOR SELECT USING (role = 'operator');

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services." ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING (auth.uid() = operator_id);

-- Add more RLS policies for other tables as needed.

-- 5. AUTOMATION: Create the function and trigger for new user profiles.
-- This function runs with the permissions of the user who defined it (superuser),
-- bypassing RLS issues during its execution.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- This trigger calls the function whenever a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ONE-TIME SYNC: Fix data for existing users.
-- This function finds users in auth.users that don't have a profile and creates one.
CREATE OR REPLACE FUNCTION public.sync_profiles_from_auth()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name'
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
END;
$$;

-- Execute the sync function once to fix any existing inconsistencies.
SELECT public.sync_profiles_from_auth();

-- 7. SEEDING: Populate with initial data for testing.
-- This part now intelligently finds users by email and promotes them.
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
      (operator_2_id, 'call', 1.80, true),
      (operator_2_id, 'written', 25.00, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;
  END IF;
END $$;

-- 1. CLEANUP: Drop all tables, types, and functions to ensure a clean slate.
-- The CASCADE option handles dependencies automatically.
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.service_type CASCADE;
DROP TYPE IF EXISTS public.consultation_status CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profiles_from_auth() CASCADE;

-- 2. SETUP: Create all ENUM types first.
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.service_type AS ENUM ('chat', 'call', 'written');
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'refunded');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'consultation_payment', 'payout', 'refund');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. CREATE TABLES: Define all tables with correct columns and relationships.
-- Profiles Table: Stores public user data, linked to auth.users.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    email TEXT, -- This will be synced from auth.users
    avatar_url TEXT,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Operator-specific fields
    headline TEXT,
    bio TEXT,
    specializations TEXT[],
    is_online BOOLEAN NOT NULL DEFAULT false,
    online_status TEXT,
    application_status application_status NOT NULL DEFAULT 'pending', -- THIS IS THE CORRECTED, INCLUDED COLUMN
    is_visible BOOLEAN NOT NULL DEFAULT false,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    
    -- Fiscal data
    fiscal_code TEXT,
    vat_number TEXT,
    billing_address TEXT,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Stores all user profiles, extending the auth.users table with public and role-specific data.';

-- Services Table: Defines the services offered by operators.
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
COMMENT ON TABLE public.services IS 'Defines the services offered by each operator, including pricing.';

-- Consultations Table: Logs every consultation session.
CREATE TABLE public.consultations (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
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
COMMENT ON TABLE public.consultations IS 'Logs every consultation between a client and an operator.';

-- Reviews Table: Stores client reviews for completed consultations.
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id INT REFERENCES public.consultations(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.reviews IS 'Stores client reviews for operators after a consultation.';

-- Transactions Table: Logs all financial movements in the platform.
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    consultation_id INT REFERENCES public.consultations(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.transactions IS 'Logs all financial transactions, like wallet recharges and payouts.';

-- 4. SETUP TRIGGERS AND FUNCTIONS: Automate profile creation.
-- This function creates a new profile whenever a new user signs up in auth.users.
-- SECURITY DEFINER gives it the necessary permissions to run correctly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- The trigger that calls the function above.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- This function syncs existing auth.users to profiles if they are missing.
CREATE OR REPLACE FUNCTION public.sync_profiles_from_auth()
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

-- 5. INITIAL DATA SYNC AND SEEDING: Run the sync and populate test data.
-- Run the sync function once to fix any existing inconsistencies.
SELECT public.sync_profiles_from_auth();

-- Seed data for two test operators.
-- This block finds the users by email and promotes them to operators.
DO $$
DECLARE
    operator_1_id UUID;
    operator_2_id UUID;
BEGIN
    -- Find the UUIDs for the test operator emails
    SELECT id INTO operator_1_id FROM auth.users WHERE email = 'operator1@example.com';
    SELECT id INTO operator_2_id FROM auth.users WHERE email = 'operator2@example.com';

    -- If the first operator exists, update their profile and add services
    IF operator_1_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            role = 'operator',
            full_name = 'Luna Stellare',
            headline = 'Guida esperta in tarocchi e astrologia karmica.',
            bio = 'Con oltre 15 anni di esperienza, offro letture profonde e compassionevoli per illuminare il tuo cammino. Specializzata in relazioni e crescita personale.',
            specializations = ARRAY['cartomanzia', 'astrologia'],
            application_status = 'approved',
            is_visible = true,
            avatar_url = '/placeholder.svg?width=128&height=128'
        WHERE id = operator_1_id;

        INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
        VALUES (operator_1_id, 'call', 1.50, true), (operator_1_id, 'chat', 1.20, true)
        ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;
    END IF;

    -- If the second operator exists, update their profile and add services
    IF operator_2_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            role = 'operator',
            full_name = 'Maestro Cosmos',
            headline = 'Analisi del tema natale e numerologia evolutiva.',
            bio = 'Svela i segreti del tuo destino attraverso la saggezza dei numeri e delle stelle. Un approccio pratico e profondo per comprendere il tuo potenziale.',
            specializations = ARRAY['astrologia', 'numerologia'],
            application_status = 'approved',
            is_visible = true,
            avatar_url = '/placeholder.svg?width=128&height=128'
        WHERE id = operator_2_id;

        INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
        VALUES (operator_2_id, 'call', 1.80, true), (operator_2_id, 'chat', 1.40, true)
        ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;
    END IF;
END $$;

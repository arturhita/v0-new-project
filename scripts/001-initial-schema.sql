-- STEP 1: Drop old objects if they exist to ensure a clean slate.
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.operator_details CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 2: Create the core `profiles` table.
-- This table stores public data for all users and is linked to Supabase's auth system.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'operator', 'admin'))
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.profiles IS 'Stores public profile information for all user types.';

-- STEP 3: Create the `operator_details` table.
-- This table stores specific information only for users with the 'operator' role.
CREATE TABLE public.operator_details (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_name TEXT UNIQUE,
    bio TEXT,
    specialties TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00
);
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.operator_details IS 'Stores detailed information specific to operators.';

-- STEP 4: Create the `services` table.
-- This table stores the different types of services an operator can offer.
CREATE TABLE public.services (
    id SERIAL PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operator_details(user_id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('chat', 'call', 'email')),
    price NUMERIC(10, 2) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(operator_id, service_type)
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.services IS 'Defines the services and pricing for each operator.';

-- STEP 5: Create `wallets` and `transactions` tables.
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.wallets IS 'Manages the credit balance for each user.';

CREATE TABLE public.transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'consultation_fee', 'refund', 'earning')),
    description TEXT,
    related_consultation_id BIGINT, -- Can be linked to a consultation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.transactions IS 'Logs all financial movements for every wallet.';

-- STEP 6: Create `consultations` and `reviews` tables.
CREATE TABLE public.consultations (
    id BIGSERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    operator_id UUID NOT NULL REFERENCES public.operator_details(user_id),
    service_id INT NOT NULL REFERENCES public.services(id),
    status TEXT NOT NULL CHECK (status IN ('requested', 'active', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    cost NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.consultations IS 'Records every consultation session on the platform.';

CREATE TABLE public.reviews (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT UNIQUE NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    operator_id UUID NOT NULL REFERENCES public.operator_details(user_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.reviews IS 'Stores user reviews for completed consultations.';

-- STEP 7: Create the function to handle new user sign-ups.
-- This function automatically creates a profile and a wallet for each new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::text
  );

  -- Create a wallet for the new user
  INSERT INTO public.wallets (id, balance)
  VALUES (NEW.id, 0.00);

  -- If the user is an operator, create an entry in operator_details
  IF (NEW.raw_user_meta_data->>'role' = 'operator') THEN
    INSERT INTO public.operator_details (user_id, stage_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'stage_name');
  END IF;

  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to populate profiles and wallets on new user creation.';

-- STEP 8: Create the trigger that executes the function on new user creation.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- STEP 9: Define Row Level Security (RLS) policies.
-- Profiles: Users can see all profiles, but only edit their own.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Wallets: Users can only see and manage their own wallet.
CREATE POLICY "Users can view their own wallet." ON public.wallets FOR SELECT USING (auth.uid() = id);

-- Operator Details: Viewable by all, editable only by the operator or an admin.
CREATE POLICY "Operator details are public." ON public.operator_details FOR SELECT USING (true);
CREATE POLICY "Operators can update their own details." ON public.operator_details FOR UPDATE USING (auth.uid() = user_id);
-- Note: Admin policies would be added here, e.g., with `check (get_my_claim('user_role') = 'admin')`

-- Add more policies for other tables as needed.

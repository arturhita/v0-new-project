-- =================================================================
-- FULL SCHEMA RESET SCRIPT (v3 - TRIGGER FIX)
-- This script resets and rebuilds the entire user/operator schema and all its dependencies.
-- It explicitly drops the trigger on auth.users before dropping the function to solve dependency errors.
-- =================================================================

-- Step 1: Drop dependent views first.
DROP VIEW IF EXISTS public.operators_view;
DROP VIEW IF EXISTS public.admin_users_view;
DROP VIEW IF EXISTS public.admin_operators_view; -- legacy name

-- Step 2: Drop the trigger from the auth.users table. THIS IS THE CRITICAL FIX.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Now that the trigger is gone, drop the function.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Drop the core tables with CASCADE.
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.operators CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- Step 5: Drop types.
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.operator_status;

-- =================================================================
-- REBUILD SCHEMA
-- =================================================================

-- Step 6: Re-create custom ENUM types.
CREATE TYPE public.user_role AS ENUM ('admin', 'client', 'operator');
CREATE TYPE public.operator_status AS ENUM ('active', 'pending', 'suspended');

-- Step 7: Re-create the 'profiles' table.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    username text UNIQUE,
    email text UNIQUE,
    role public.user_role DEFAULT 'client'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Stores public profile data for all users, linking to auth.users.';

-- Step 8: Re-create the 'operators' table.
CREATE TABLE public.operators (
    profile_id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    commission_rate integer DEFAULT 20 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
    status public.operator_status DEFAULT 'pending'::public.operator_status NOT NULL,
    main_discipline text,
    specializations text[],
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.operators IS 'Stores data specific to users with the ''operator'' role.';

-- Step 9: Re-create other core tables that were affected by CASCADE.
CREATE TABLE public.categories (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text
);

CREATE TABLE public.operator_categories (
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id integer NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);

CREATE TABLE public.wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance numeric(10, 2) NOT NULL DEFAULT 0.00,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    is_approved boolean DEFAULT true,
    moderation_notes text
);

CREATE TABLE public.chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    status text
);

CREATE TABLE public.messages (
    id bigserial PRIMARY KEY,
    session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text,
    created_at timestamp with time zone DEFAULT now(),
    is_read boolean DEFAULT false
);

-- Step 10: Create the is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role = 'admin';
END;
$$;

-- Step 11: Re-create the function to handle new user sign-ups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role)
  );
  INSERT INTO public.wallets (user_id) VALUES (new.id);
  IF (new.raw_user_meta_data->>'role')::public.user_role = 'operator' THEN
    INSERT INTO public.operators (profile_id, main_discipline)
    VALUES (new.id, new.raw_user_meta_data->>'main_discipline');
  END IF;
  RETURN new;
END;
$$;

-- Step 12: Re-create the trigger.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 13: Re-create the necessary views.
CREATE OR REPLACE VIEW public.operators_view AS
SELECT
    p.id AS profile_id, p.full_name, p.username, p.email, p.role, p.created_at AS profile_created_at,
    o.commission_rate, o.status, o.bio, o.main_discipline, o.specializations, o.joined_at
FROM public.profiles p JOIN public.operators o ON p.id = o.profile_id
WHERE p.role = 'operator';

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT p.id, p.full_name, p.username, p.email, p.role, p.created_at, w.balance
FROM public.profiles p LEFT JOIN public.wallets w ON p.id = w.user_id;

-- Step 14: Re-apply Row Level Security (RLS).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Operator data is viewable by everyone." ON public.operators FOR SELECT USING (true);
CREATE POLICY "Operators can update their own data." ON public.operators FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Admins can manage all operators." ON public.operators FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own wallet." ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets." ON public.wallets FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all reviews." ON public.reviews FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can access their own chat sessions." ON public.chat_sessions FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Users can access messages in their sessions." ON public.messages FOR ALL USING ( (auth.uid() = sender_id OR auth.uid() = receiver_id) AND (SELECT true FROM chat_sessions WHERE id = session_id) );

CREATE POLICY "Categories are public." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Operator categories are public." ON public.operator_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage operator categories." ON public.operator_categories FOR ALL USING (public.is_admin(auth.uid()));

-- Step 15: Seed initial data
INSERT INTO public.categories (name, slug, description) VALUES
('Cartomanzia', 'cartomanzia', 'Lettura dei tarocchi e delle carte per divinazione.'),
('Astrologia', 'astrologia', 'Studio degli astri e del loro influsso sulla vita.'),
('Sensitivi', 'sensitivi', 'Consulenti con doti di percezione extrasensoriale.'),
('Benessere', 'benessere', 'Consulenze per il benessere fisico e spirituale.')
ON CONFLICT (slug) DO NOTHING;

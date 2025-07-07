-- 1. Create custom types for roles and statuses to ensure data integrity.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status') THEN
        CREATE TYPE public.operator_status AS ENUM ('pending_approval', 'active', 'inactive', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_session_status') THEN
        CREATE TYPE public.chat_session_status AS ENUM ('pending', 'accepted', 'declined', 'active', 'ended', 'cancelled');
    END IF;
END$$;


-- 2. Create or update the 'profiles' table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  name text,
  email text UNIQUE,
  role public.user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00,
  status public.operator_status, -- Only relevant for operators
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure the foreign key to auth.users is set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_id_fkey' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- 3. Create operator_details table for operator-specific public info
CREATE TABLE IF NOT EXISTS public.operator_details (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  bio text,
  specialties jsonb,
  categories text[],
  chat_price_per_minute numeric(10, 2) DEFAULT 1.00,
  call_price_per_minute numeric(10, 2) DEFAULT 1.50,
  written_consultation_price numeric(10, 2) DEFAULT 20.00,
  is_chat_enabled boolean DEFAULT true,
  is_call_enabled boolean DEFAULT true,
  is_written_consultation_enabled boolean DEFAULT true,
  average_rating numeric(3, 2) DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;


-- 4. Create chat_sessions and chat_messages tables
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id),
  operator_id uuid NOT NULL REFERENCES public.profiles(id),
  status public.chat_session_status NOT NULL DEFAULT 'pending',
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;


-- 5. Update the function to handle new user creation
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role public.user_role;
BEGIN
  user_role := (new.raw_user_meta_data->>'role')::public.user_role;
  IF user_role IS NULL THEN
    user_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, user_role);

  IF user_role = 'operator' THEN
    INSERT INTO public.operator_details (id, stage_name)
    VALUES (new.id, new.raw_user_meta_data->>'stage_name');
  END IF;

  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 6. RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles." ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view operator profiles." ON public.profiles;

CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles." ON public.profiles FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Authenticated users can view operator profiles." ON public.profiles FOR SELECT USING (role = 'operator');

-- Operator Details
DROP POLICY IF EXISTS "Public can view operator details" ON public.operator_details;
DROP POLICY IF EXISTS "Operators can update their own details" ON public.operator_details;
DROP POLICY IF EXISTS "Admins can manage operator details" ON public.operator_details;

CREATE POLICY "Public can view operator details" ON public.operator_details FOR SELECT USING (true);
CREATE POLICY "Operators can update their own details" ON public.operator_details FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage operator details" ON public.operator_details FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Chat Sessions & Messages
DROP POLICY IF EXISTS "Users can access their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can access messages in their own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat sessions and messages" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins can view all chat sessions and messages" ON public.chat_messages;

CREATE POLICY "Users can access their own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Users can access messages in their own sessions" ON public.chat_messages FOR ALL USING (
  (SELECT client_id FROM public.chat_sessions WHERE id = session_id) = auth.uid() OR
  (SELECT operator_id FROM public.chat_sessions WHERE id = session_id) = auth.uid()
);
CREATE POLICY "Admins can view all chat sessions and messages" ON public.chat_sessions FOR SELECT USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all chat sessions and messages" ON public.chat_messages FOR SELECT USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 7. INSTRUCTIONS FOR ADMIN CREATION
/******************************************************************************
* IMPORTANT: ADMIN USER CREATION
*
* To create the admin user, follow these steps:
*
* 1. Manually sign up through your application's registration page using the
*    following credentials:
*    - Email:    pagamenticonsulenza@gmail.com
*    - Password: @Annaadmin2025@#
*    - Name:     Admin
*
* 2. After successful registration, connect to your Supabase database using the
*    SQL Editor in the Supabase Dashboard.
*
* 3. Run the following SQL command to elevate the new user to an admin role:
*
*    UPDATE public.profiles
*    SET role = 'admin'
*    WHERE email = 'pagamenticonsulenza@gmail.com';
*
* This two-step process is necessary for security, as user creation with a
* password must go through the Supabase Auth service.
******************************************************************************/

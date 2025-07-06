-- 1. CREATE CUSTOM TYPES (with CASCADE to avoid errors on re-run)
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');

DROP TYPE IF EXISTS public.consultation_status CASCADE;
CREATE TYPE public.consultation_status AS ENUM ('pending', 'answered', 'rejected', 'in_progress');

-- 2. CREATE PROFILES TABLE
-- This table will hold public user data, extending auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamp with time zone,
  role public.user_role NOT NULL DEFAULT 'client'::user_role,
  name character varying(255),
  nickname character varying(50) UNIQUE,
  avatar_url text,
  bio text, -- For operators
  specialties text[], -- Array of specialties for operators
  is_online boolean DEFAULT false, -- Operator's availability status
  wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00, -- For clients
  operator_rate_per_minute numeric(10, 2) -- Rate for operators
);
COMMENT ON TABLE public.profiles IS 'Public profile data for users.';

-- 3. SETUP ROW LEVEL SECURITY (RLS) FOR PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. CREATE FUNCTION TO HANDLE NEW USERS
-- This trigger automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role) -- Default to 'client' if role is not provided
  );
  RETURN new;
END;
$$;

-- 5. CREATE TRIGGER FOR NEW USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. CREATE CONTENT TABLES (BLOG/ASTROMAG)
CREATE TABLE public.categories (
  id bigserial PRIMARY KEY,
  name character varying(255) NOT NULL,
  slug character varying(255) NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.articles (
  id bigserial PRIMARY KEY,
  title character varying(255) NOT NULL,
  slug character varying(255) NOT NULL UNIQUE,
  content text,
  image_url text,
  author_id uuid REFERENCES public.profiles(id),
  category_id bigint REFERENCES public.categories(id),
  created_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles are viewable by everyone." ON public.articles FOR SELECT USING (published_at IS NOT NULL AND published_at <= now());

-- 7. CREATE INTERACTION TABLES
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
ALTER TABLE public.written_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own consultations." ON public.written_consultations
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);

CREATE TABLE public.reviews (
  id bigserial PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.profiles(id),
  operator_id uuid NOT NULL REFERENCES public.profiles(id),
  consultation_id bigint, -- Can be linked to a specific consultation
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can insert reviews for their consultations." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 8. SEED DATA (Optional, for testing)
INSERT INTO public.categories (name, slug) VALUES
('Cartomanzia', 'cartomanzia'),
('Astrologia', 'astrologia'),
('Spiritualità', 'spiritualita')
ON CONFLICT (slug) DO NOTHING;

-- End of script

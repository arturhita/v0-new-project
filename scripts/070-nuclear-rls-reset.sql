-- THIS IS A "SCORCHED EARTH" SCRIPT. IT IS DESIGNED TO BE AGGRESSIVE.

-- STEP 1: Forcefully disable Row Level Security on the profiles table.
-- This immediately invalidates all active policies and is the key to breaking the recursion loop.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all known legacy policies by name.
-- Even with RLS disabled, we run these to clean up any orphaned policy definitions.
DROP POLICY IF EXISTS "Profiles are viewable by owners and the public if active operator" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to active operators" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Unified Select Policy for Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update for owners" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners and public operators" ON public.profiles;

-- STEP 3: Re-enable Row Level Security on a now-clean table.
-- This forces Postgres to re-evaluate the security state from scratch.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY; -- Crucial for Supabase API integration

-- STEP 4: Install the final, simple, non-recursive policies.
-- Create a single, unified SELECT policy.
CREATE POLICY "Profiles are viewable by owners and public operators"
ON public.profiles FOR SELECT
USING (
  (auth.uid() = id) OR
  (role = 'operator' AND status = 'active')
);

-- Create a single, simple UPDATE policy.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- STEP 5: Final cleanup of the user creation trigger to ensure consistency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'client');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

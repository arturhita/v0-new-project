-- FINAL ATTEMPT TO FIX AUTHENTICATION
-- The diagnostic tool confirmed the profile exists but is not accessible.
-- This script performs a full reset of the RLS policies for the profiles table.

-- Step 1: Temporarily disable RLS to allow dropping all policies without restriction.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Clean up any previous triggers, functions, and policies to ensure a clean slate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_my_profile();

-- Drop all known policy names we've tried before.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;


-- Step 3: Recreate the function to handle new user creation.
-- This part is confirmed to be working correctly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  RETURN new;
END;
$$;

-- Step 4: Recreate the trigger.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create the definitive, simple, and correct RLS policies.
-- Policy 1: Users can select/update/insert/delete their own profile.
-- The `USING` clause is for SELECT, and the `WITH CHECK` is for INSERT/UPDATE.
CREATE POLICY "Users can access their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 2 (Good practice): Admins can do anything.
-- This checks if the user's own profile has the role 'admin'.
CREATE POLICY "Admins have full access"
  ON public.profiles FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Step 6: Re-enable Row Level Security.
-- The table will now be protected by ONLY the two policies above.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS to be applied, even for table owners.
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

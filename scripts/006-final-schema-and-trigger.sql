-- 1. Drop the old function and trigger if they exist, to prevent conflicts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 2. Alter the profiles table to make it more robust.
--    Set default values so that the trigger doesn't need to provide them.
ALTER TABLE public.profiles
  ALTER COLUMN full_name SET DEFAULT 'Nuovo Utente',
  ALTER COLUMN role SET DEFAULT 'client'::public.user_role;

-- 3. Create the new, simplified function.
--    It only needs to insert the user's ID and email. The rest is handled by defaults.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name' -- Safely get the name from metadata if it exists
  );
  RETURN new;
END;
$$;

-- 4. Create the trigger to call the function after a new user signs up.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Grant permissions to the necessary roles.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

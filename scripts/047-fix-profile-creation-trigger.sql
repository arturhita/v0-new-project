{`-- Drop the existing trigger and function to ensure a clean slate and avoid conflicts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function that will be executed by the trigger.
-- This function inserts a new row into public.profiles when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record for the newly created user.
  -- The user ID is taken from the 'new' user record in the auth.users table.
  -- The role is defaulted to 'client'.
  -- The full_name is extracted from the metadata provided during sign-up.
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'client', new.raw_user_meta_data->>'full_name');
  
  RETURN new;
END;
$$;

-- Create the trigger that fires the handle_new_user function
-- automatically AFTER a new user is inserted into the auth.users table.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions to ensure the trigger can operate correctly.
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres;
`}

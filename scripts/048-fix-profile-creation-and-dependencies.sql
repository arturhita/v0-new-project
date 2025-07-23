-- Step 1: Drop the dependent trigger first to resolve the dependency issue.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Now it's safe to drop the function.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Recreate the function with the correct default services object.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Extract email and role from metadata, default role to 'client'
  user_email := new.email;
  user_role := new.raw_user_meta_data->>'role';
  IF user_role IS NULL OR user_role NOT IN ('admin', 'operator', 'client') THEN
    user_role := 'client';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, full_name, email, role, services)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    user_email,
    user_role::public.user_role,
    -- Provide a default, structured services object to prevent errors on new user creation
    '{
      "chat": {"enabled": false, "price_per_minute": 0},
      "call": {"enabled": false, "price_per_minute": 0},
      "video": {"enabled": false, "price_per_minute": 0}
    }'::jsonb
  );
  RETURN new;
END;
$$;

-- Step 4: Re-apply the trigger to the users table.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

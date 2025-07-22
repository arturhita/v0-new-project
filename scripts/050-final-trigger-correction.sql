-- Drop the old function and trigger if they exist to ensure a clean slate.
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

    -- Create the function to handle new user creation.
    -- This function inserts a new row into the public.profiles table.
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, email, role)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        'client' -- Sets the default role for all new users to 'client'.
      );
      RETURN new;
    END;
    $$;

    -- Create the trigger that fires after a new user is inserted into auth.users.
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

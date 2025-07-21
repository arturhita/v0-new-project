-- Drop the policy if it already exists to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- Create the policy to allow users to select their own profile data
CREATE POLICY "Users can view their own profile."
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

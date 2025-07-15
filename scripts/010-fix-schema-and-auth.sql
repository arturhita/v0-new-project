-- 1. Add all necessary columns to the 'profiles' table if they don't exist.
-- This makes the operation safe to run multiple times.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS services JSONB,
ADD COLUMN IF NOT EXISTS availability JSONB,
ADD COLUMN IF NOT EXISTS average_rating REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; -- e.g., pending, active, suspended

-- 2. Ensure 'full_name' column exists, renaming from 'name' if necessary.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='name')
  AND NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles RENAME COLUMN name TO full_name;
  END IF;
END $$;

-- 3. Re-create the function to copy data from auth.users to public.profiles
-- This ensures new user data (like full_name) is always in sync.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-apply the trigger to ensure it's active.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Add a function to calculate and update operator ratings.
-- This should be called after a new review is inserted.
CREATE OR REPLACE FUNCTION public.update_operator_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating REAL;
  review_count INT;
BEGIN
  -- Calculate the new average rating and review count for the operator
  SELECT
    AVG(rating),
    COUNT(id)
  INTO
    avg_rating,
    review_count
  FROM
    public.reviews
  WHERE
    operator_id = NEW.operator_id;

  -- Update the profiles table
  UPDATE public.profiles
  SET
    average_rating = avg_rating,
    reviews_count = review_count
  WHERE
    id = NEW.operator_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a trigger to automatically update ratings when a review is added.
DROP TRIGGER IF EXISTS on_new_review ON public.reviews;
CREATE TRIGGER on_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_operator_rating();

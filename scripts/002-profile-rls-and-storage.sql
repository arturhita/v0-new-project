-- =================================================================
-- PROFILES TABLE POLICIES
-- =================================================================

-- Step 1: Enable Row Level Security on the 'profiles' table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Remove old policies to ensure a clean slate.
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

-- Step 3: Create a policy for SELECT operations.
-- Allows users to read *only* their own profile data.
CREATE POLICY profiles_select_own
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- Step 4: Create a policy for UPDATE operations.
-- Allows users to update *only* their own profile data.
CREATE POLICY profiles_update_own
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );


-- =================================================================
-- STORAGE (AVATARS BUCKET) POLICIES
-- =================================================================

-- Step 5: Remove old storage policies to avoid conflicts.
DROP POLICY IF EXISTS storage_avatars_select_public ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_insert_authenticated ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_delete_own ON storage.objects;

-- Step 6: Create a policy for public SELECT on avatars.
-- Allows anyone to view images in the 'avatars' bucket.
CREATE POLICY storage_avatars_select_public
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Step 7: Create a policy for INSERT operations.
-- Allows an authenticated user to upload a file to the 'avatars' bucket.
-- The `WITH CHECK` clause ensures the file is for the correct bucket
-- AND that the uploader is the owner of the file record. This is the key change.
CREATE POLICY storage_avatars_insert_authenticated
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND owner = auth.uid() );

-- Step 8: Create a policy for UPDATE operations.
-- Allows a user to update *only* the files they own.
CREATE POLICY storage_avatars_update_own
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() );

-- Step 9: Create a policy for DELETE operations.
-- Allows a user to delete *only* the files they own.
CREATE POLICY storage_avatars_delete_own
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() );

-- Step 1: Create a new ENUM type for operator status.
-- Using an ENUM is better for data integrity than a plain text field.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status') THEN
        CREATE TYPE public.operator_status AS ENUM (
            'pending',  -- In attesa di approvazione
            'approved', -- Approvato e visibile
            'rejected', -- Rifiutato
            'suspended' -- Sospeso dall'admin
        );
    END IF;
END$$;

-- Step 2: Add the 'status' column to the profiles table if it doesn't exist.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status public.operator_status;

-- Step 3: Set a default value for the new 'status' column.
-- This ensures new profiles get a status automatically. For operators, it will be 'pending'.
ALTER TABLE public.profiles
ALTER COLUMN status SET DEFAULT 'pending';

-- Step 4: Update existing users to have a default status.
-- We'll approve existing operators and clients to avoid breaking their experience.
UPDATE public.profiles
SET status = 'approved'
WHERE status IS NULL;

-- Step 5: Make the status column NOT NULL after populating it.
ALTER TABLE public.profiles
ALTER COLUMN status SET NOT NULL;


-- Step 6: Clean up old, incorrect policies to avoid conflicts.
DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo." ON public.profiles;
DROP POLICY IF EXISTS "Gli utenti possono leggere il proprio profilo" ON public.profiles;
DROP POLICY IF EXISTS "I profili degli operatori approvati sono pubblici" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

DROP POLICY IF EXISTS "Qualsiasi utente può caricare un avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può aggiornare il proprio avatar." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può vedere il proprio avatar." ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Un utente può caricare il proprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Un utente può cancellare il proprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Gli avatar sono visibili pubblicamente" ON storage.objects;


-- Step 7: Re-create the correct policies for PROFILES.
-- Policy 7.1: Users can read their own profile.
CREATE POLICY "policy_select_own_profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- Policy 7.2: Users can update their own profile.
CREATE POLICY "policy_update_own_profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- Policy 7.3: Public can view approved operators. THIS IS THE ONE THAT FAILED.
CREATE POLICY "policy_select_public_operators"
ON public.profiles FOR SELECT
USING ( role = 'operator' AND status = 'approved' );


-- Step 8: Re-create the correct policies for STORAGE (avatars).
-- Policy 8.1: Avatars are publicly visible.
CREATE POLICY "policy_select_public_avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy 8.2: Authenticated users can upload to their own folder.
-- The folder name must match their user ID.
CREATE POLICY "policy_insert_own_avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Policy 8.3: Authenticated users can update their own avatar.
CREATE POLICY "policy_update_own_avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = (storage.foldername(name))[1]::uuid );

-- Policy 8.4: Authenticated users can delete their own avatar.
CREATE POLICY "policy_delete_own_avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = (storage.foldername(name))[1]::uuid );

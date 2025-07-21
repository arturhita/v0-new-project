-- This script will completely reset the payout_requests table to fix schema inconsistencies.
-- WARNING: This will delete any existing data in the payout_requests table.

-- Step 1: Drop the existing table and all its dependencies (like foreign keys)
DROP TABLE IF EXISTS public.payout_requests CASCADE;

-- Step 2: Recreate the table with the correct and consistent column name 'user_id'
CREATE TABLE public.payout_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL, -- Using user_id for consistency
    amount numeric(10, 2) NOT NULL,
    status public.payout_status DEFAULT 'pending'::public.payout_status NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payout_requests_pkey PRIMARY KEY (id),
    CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Step 3: Add comments to the columns for clarity
COMMENT ON COLUMN public.payout_requests.user_id IS 'Links to the profiles table for the operator making the request.';
COMMENT ON COLUMN public.payout_requests.amount IS 'The amount requested for payout.';
COMMENT ON COLUMN public.payout_requests.status IS 'The current status of the payout request.';

-- Step 4: Re-enable Row Level Security (RLS)
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for the new table
-- Policy 1: Admins can see all payout requests.
CREATE POLICY "Admins can view all payout requests"
ON public.payout_requests
FOR SELECT
TO authenticated
USING (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb
);

-- Policy 2: Operators can only see their own payout requests.
CREATE POLICY "Operators can view their own payout requests"
ON public.payout_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy 3: Operators can create their own payout requests.
CREATE POLICY "Operators can create their own payout requests"
ON public.payout_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Policy 4: Admins can update any payout request (e.g., to change status).
CREATE POLICY "Admins can update payout requests"
ON public.payout_requests
FOR UPDATE
TO authenticated
USING (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb
)
WITH CHECK (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb
);

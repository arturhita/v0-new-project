-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.payout_requests
DROP CONSTRAINT IF EXISTS payout_requests_operator_id_fkey;

-- Step 2: Rename the column from operator_id to user_id
ALTER TABLE public.payout_requests
RENAME COLUMN operator_id TO user_id;

-- Step 3: Add the foreign key constraint back on the new user_id column
ALTER TABLE public.payout_requests
ADD CONSTRAINT payout_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Step 4: Update RLS policies to use user_id
-- Drop old policies
DROP POLICY IF EXISTS "Allow operators to view their own payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Allow operators to create their own payout requests" ON public.payout_requests;

-- Recreate policies with the new column name
CREATE POLICY "Allow operators to view their own payout requests"
ON public.payout_requests
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt() ->> 'user_role')::text = 'operator' AND user_id = (SELECT auth.uid())
);

CREATE POLICY "Allow operators to create their own payout requests"
ON public.payout_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt() ->> 'user_role')::text = 'operator' AND user_id = (SELECT auth.uid())
);

-- Drop the faulty policies created in the previous script to avoid conflicts.
DROP POLICY IF EXISTS "Operators can view their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Operators can create requests" ON public.commission_increase_requests;

-- Recreate policies with the correct logic.
-- This fixes the "column user_id does not exist" error by correctly
-- comparing the authenticated user's ID (auth.uid()) with the operator_id in the table.
CREATE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = operator_id);

CREATE POLICY "Operators can create requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = operator_id);

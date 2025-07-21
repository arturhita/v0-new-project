-- Create an enum type for payout status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
        CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'rejected', 'on_hold');
    END IF;
END$$;

-- Create the payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    notes TEXT, -- Optional notes from admin
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_payout_request_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS on_payout_request_update ON public.payout_requests;
CREATE TRIGGER on_payout_request_update
BEFORE UPDATE ON public.payout_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_payout_request_update();

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Policies for payout_requests
-- Admins can see all requests
DROP POLICY IF EXISTS "Allow admin full access to payout requests" ON public.payout_requests;
CREATE POLICY "Allow admin full access to payout requests"
ON public.payout_requests
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt() ->> 'user_role')::text = 'admin'
)
WITH CHECK (
  (SELECT auth.jwt() ->> 'user_role')::text = 'admin'
);

-- Operators can see their own requests
DROP POLICY IF EXISTS "Allow operators to view their own payout requests" ON public.payout_requests;
CREATE POLICY "Allow operators to view their own payout requests"
ON public.payout_requests
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt() ->> 'user_role')::text = 'operator' AND operator_id = (SELECT auth.uid())
);

-- Operators can create their own requests
DROP POLICY IF EXISTS "Allow operators to create their own payout requests" ON public.payout_requests;
CREATE POLICY "Allow operators to create their own payout requests"
ON public.payout_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt() ->> 'user_role')::text = 'operator' AND operator_id = (SELECT auth.uid())
);

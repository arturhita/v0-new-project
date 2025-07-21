-- Create status type for commission requests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_request_status') THEN
        CREATE TYPE commission_request_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END$$;

-- Create commission_requests table
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission_rate real NOT NULL,
    requested_commission_rate real NOT NULL,
    justification text NOT NULL,
    status commission_request_status NOT NULL DEFAULT 'pending',
    admin_notes text, -- Optional notes from the admin when approving/rejecting
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for commission_requests
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

-- Operators can see their own requests
CREATE POLICY "Operators can view their own commission requests"
ON public.commission_requests FOR SELECT
USING (auth.uid() = operator_id);

-- Operators can insert their own requests
CREATE POLICY "Operators can create their own commission requests"
ON public.commission_requests FOR INSERT
WITH CHECK (auth.uid() = operator_id);

-- Admins can see all requests
CREATE POLICY "Admins can view all commission requests"
ON public.commission_requests FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update requests
CREATE POLICY "Admins can update commission requests"
ON public.commission_requests FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for commission_requests
DROP TRIGGER IF EXISTS on_commission_requests_updated ON public.commission_requests;
CREATE TRIGGER on_commission_requests_updated
BEFORE UPDATE ON public.commission_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Step 1: Fix the advanced_settings table by adding the 'type' column if it doesn't exist.
ALTER TABLE public.advanced_settings
ADD COLUMN IF NOT EXISTS type TEXT;

-- Step 2: Ensure the commission_increase_requests table exists.
-- This is the root cause of the "relation does not exist" error.
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission NUMERIC(5, 2) NOT NULL,
    requested_commission NUMERIC(5, 2) NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT
);

-- Step 3: Ensure the payout_requests table has the correct foreign key to profiles.
-- This will fix the relationship issue for payouts.
ALTER TABLE public.payout_requests
ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update existing payout_requests to link to the operator if possible
-- This is a best-effort update and might not link all old requests if user_id was inconsistent.
UPDATE public.payout_requests pr
SET operator_id = p.id
FROM public.profiles p
WHERE pr.user_id = p.id AND pr.operator_id IS NULL;


-- Step 4: Re-create policies with the correct column names to fix the 'user_id' error.
-- Drop old policies first to prevent conflicts.
DROP POLICY IF EXISTS "Operators can view their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Operators can create requests" ON public.commission_increase_requests;

-- Create policies using the correct 'operator_id' column.
CREATE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = operator_id);

CREATE POLICY "Operators can create requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = operator_id);

-- Step 5: Insert or update advanced settings, ensuring no duplicates.
-- This uses ON CONFLICT to avoid errors if keys already exist.
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('platform_commission_rate', '20', 'Commissione standard della piattaforma (in percentuale)', 'financial'),
    ('call_forwarding_fee_client', '0.15', 'Costo al minuto per il trasferimento di chiamata addebitato al cliente', 'financial'),
    ('call_forwarding_fee_operator', '0.05', 'Costo al minuto per il trasferimento di chiamata addebitato all''operatore', 'financial'),
    ('payout_processing_fee', '2.50', 'Costo fisso per l''elaborazione di una richiesta di pagamento', 'financial')
ON CONFLICT (key) DO UPDATE
SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    type = EXCLUDED.type;

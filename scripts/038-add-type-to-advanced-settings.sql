-- Step 1: Add the 'type' column to the 'advanced_settings' table if it doesn't exist.
-- This fixes the error "column "type" of relation "advanced_settings" does not exist".
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'advanced_settings'
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.advanced_settings ADD COLUMN type text;
    END IF;
END $$;

-- Step 2: Insert the financial settings, which will now work correctly.
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('financials', '{"platform_commission_percentage": 20, "call_transfer_fee_client": 0.50, "call_transfer_fee_operator": 0.25}', 'Impostazioni finanziarie globali (commissione piattaforma, tariffe trasferimento chiamata)', 'json')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    type = EXCLUDED.type;

-- Step 3: Create the table for commission increase requests by operators.
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission real NOT NULL,
    requested_commission real NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text NOT NULL, -- pending, approved, rejected
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    admin_notes text
);

-- Step 4: Enable RLS and set up policies for the new table.
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors on re-run
DROP POLICY IF EXISTS "Admin can manage commission requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Operators can view their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Operators can create requests" ON public.commission_increase_requests;

-- Recreate policies
CREATE POLICY "Admin can manage commission requests" ON public.commission_increase_requests
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = operator_id));

CREATE POLICY "Operators can create requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = operator_id));

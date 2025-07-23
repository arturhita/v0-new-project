CREATE TABLE IF NOT EXISTS public.written_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL CHECK (char_length(question) >= 20),
    answer TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'cancelled')),
    cost NUMERIC(10, 2) NOT NULL,
    answered_at TIMESTAMPTZ,
    transaction_id UUID REFERENCES public.wallet_transactions(id)
);

ALTER TABLE public.written_consultations ENABLE ROW LEVEL SECURITY;

-- Policies for written_consultations
DROP POLICY IF EXISTS "Clients can view their own written consultations." ON public.written_consultations;
CREATE POLICY "Clients can view their own written consultations."
ON public.written_consultations FOR SELECT
TO authenticated
USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Operators can view their assigned written consultations." ON public.written_consultations;
CREATE POLICY "Operators can view their assigned written consultations."
ON public.written_consultations FOR SELECT
TO authenticated
USING (operator_id = auth.uid());

DROP POLICY IF EXISTS "Clients can create written consultations." ON public.written_consultations;
CREATE POLICY "Clients can create written consultations."
ON public.written_consultations FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Operators can update their consultations with an answer." ON public.written_consultations;
CREATE POLICY "Operators can update their consultations with an answer."
ON public.written_consultations FOR UPDATE
TO authenticated
USING (operator_id = auth.uid())
WITH CHECK (status = 'answered');

DROP POLICY IF EXISTS "Admins have full access." ON public.written_consultations;
CREATE POLICY "Admins have full access."
ON public.written_consultations FOR ALL
TO service_role
USING (true);

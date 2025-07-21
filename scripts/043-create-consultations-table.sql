-- Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_type text NOT NULL CHECK (consultation_type IN ('chat', 'call', 'email')),
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_minutes integer,
    cost_per_minute numeric(10,2),
    total_cost numeric(10,2),
    notes text,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
CREATE POLICY "Users can view their own consultations"
    ON public.consultations FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = operator_id);

DROP POLICY IF EXISTS "Users can insert their own consultations" ON public.consultations;
CREATE POLICY "Users can insert their own consultations"
    ON public.consultations FOR INSERT
    WITH CHECK (auth.uid() = client_id OR auth.uid() = operator_id);

DROP POLICY IF EXISTS "Users can update their own consultations" ON public.consultations;
CREATE POLICY "Users can update their own consultations"
    ON public.consultations FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON public.consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_operator_id ON public.consultations(operator_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at);

-- Function to get consultations for client
CREATE OR REPLACE FUNCTION get_client_consultations(p_client_id uuid)
RETURNS TABLE(
    id uuid,
    operator_name text,
    operator_avatar text,
    consultation_type text,
    status text,
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_minutes integer,
    total_cost numeric,
    rating integer,
    review_text text,
    created_at timestamp with time zone
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        c.id,
        p.stage_name as operator_name,
        p.avatar_url as operator_avatar,
        c.consultation_type,
        c.status,
        c.scheduled_at,
        c.started_at,
        c.ended_at,
        c.duration_minutes,
        c.total_cost,
        c.rating,
        c.review_text,
        c.created_at
    FROM public.consultations c
    JOIN public.profiles p ON c.operator_id = p.id
    WHERE c.client_id = p_client_id
    ORDER BY c.created_at DESC;
$$;

-- Grant execution rights
GRANT EXECUTE ON FUNCTION get_client_consultations(uuid) TO authenticated;

-- Insert some sample data for testing
INSERT INTO public.consultations (client_id, operator_id, consultation_type, status, scheduled_at, started_at, ended_at, duration_minutes, cost_per_minute, total_cost, rating, review_text) 
SELECT 
    (SELECT id FROM public.profiles WHERE role = 'client' LIMIT 1),
    (SELECT id FROM public.profiles WHERE role = 'operator' LIMIT 1),
    'chat',
    'completed',
    now() - interval '7 days',
    now() - interval '7 days',
    now() - interval '7 days' + interval '30 minutes',
    30,
    1.50,
    45.00,
    5,
    'Consulenza molto utile e professionale!'
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'client') 
AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'operator');

INSERT INTO public.consultations (client_id, operator_id, consultation_type, status, scheduled_at, started_at, ended_at, duration_minutes, cost_per_minute, total_cost, rating) 
SELECT 
    (SELECT id FROM public.profiles WHERE role = 'client' LIMIT 1),
    (SELECT id FROM public.profiles WHERE role = 'operator' OFFSET 1 LIMIT 1),
    'call',
    'completed',
    now() - interval '14 days',
    now() - interval '14 days',
    now() - interval '14 days' + interval '45 minutes',
    45,
    2.00,
    90.00,
    4
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'client') 
AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'operator');

INSERT INTO public.consultations (client_id, operator_id, consultation_type, status, scheduled_at) 
SELECT 
    (SELECT id FROM public.profiles WHERE role = 'client' LIMIT 1),
    (SELECT id FROM public.profiles WHERE role = 'operator' LIMIT 1),
    'chat',
    'scheduled',
    now() + interval '3 days'
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'client') 
AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'operator');

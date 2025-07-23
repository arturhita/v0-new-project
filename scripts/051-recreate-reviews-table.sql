-- Drop existing table and related types/policies if they exist to ensure a clean slate
DROP TABLE IF EXISTS public.reviews;

-- Recreate the reviews table with the correct structure
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    service_type TEXT, -- e.g., 'chat', 'call', 'written'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX ON public.reviews (client_id);
CREATE INDEX ON public.reviews (operator_id);
CREATE INDEX ON public.reviews (status);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view approved reviews"
ON public.reviews FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can insert their own reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Trigger to handle updated_at timestamp
CREATE TRIGGER on_review_update
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create the promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    special_price numeric(10, 2) NOT NULL,
    original_price numeric(10, 2) NOT NULL,
    discount_percentage integer,
    valid_days text[] NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    start_time time,
    end_time time,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotions table
DROP POLICY IF EXISTS "Allow admin full access" ON public.promotions;
CREATE POLICY "Allow admin full access"
ON public.promotions
FOR ALL
TO authenticated
USING (get_my_claim('user_role') = '"admin"'::jsonb)
WITH CHECK (get_my_claim('user_role') = '"admin"'::jsonb);

DROP POLICY IF EXISTS "Allow authenticated users to read active promotions" ON public.promotions;
CREATE POLICY "Allow authenticated users to read active promotions"
ON public.promotions
FOR SELECT
TO authenticated
USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_promotion_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS on_promotion_update ON public.promotions;
CREATE TRIGGER on_promotion_update
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.handle_promotion_update();

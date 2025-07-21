-- Create operator_earnings table to track all earnings
CREATE TABLE IF NOT EXISTS operator_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_id UUID, -- Reference to consultation if applicable
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('chat', 'call', 'written')),
    gross_amount DECIMAL(10,2) NOT NULL CHECK (gross_amount >= 0),
    commission_rate DECIMAL(5,4) DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1),
    commission_amount DECIMAL(10,2) GENERATED ALWAYS AS (gross_amount * commission_rate) STORED,
    net_amount DECIMAL(10,2) GENERATED ALWAYS AS (gross_amount - (gross_amount * commission_rate)) STORED,
    duration_minutes INTEGER, -- For timed services
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_earnings_operator_id ON operator_earnings(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_created_at ON operator_earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_service_type ON operator_earnings(service_type);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_status ON operator_earnings(status);

-- Enable RLS
ALTER TABLE operator_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view their own earnings" ON operator_earnings
    FOR SELECT USING (operator_id = auth.uid());

CREATE POLICY "System can insert earnings" ON operator_earnings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Operators can update their own earnings" ON operator_earnings
    FOR UPDATE USING (operator_id = auth.uid());

-- Function to get operator earnings summary
CREATE OR REPLACE FUNCTION get_operator_earnings_summary(p_operator_id UUID)
RETURNS TABLE (
    total_earnings DECIMAL(10,2),
    monthly_earnings DECIMAL(10,2),
    weekly_earnings DECIMAL(10,2),
    daily_earnings DECIMAL(10,2),
    total_consultations INTEGER,
    monthly_consultations INTEGER,
    weekly_consultations INTEGER,
    daily_consultations INTEGER,
    monthly_growth_rate DECIMAL(5,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
    previous_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    current_week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
    current_day DATE := CURRENT_DATE;
    previous_month_earnings DECIMAL(10,2);
BEGIN
    -- Get previous month earnings for growth calculation
    SELECT COALESCE(SUM(net_amount), 0) INTO previous_month_earnings
    FROM operator_earnings 
    WHERE operator_id = p_operator_id 
    AND status = 'completed'
    AND created_at >= previous_month_start 
    AND created_at < current_month_start;

    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= current_month_start THEN net_amount ELSE 0 END), 0) as monthly_earnings,
        COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= current_week_start THEN net_amount ELSE 0 END), 0) as weekly_earnings,
        COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = current_day THEN net_amount ELSE 0 END), 0) as daily_earnings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as total_consultations,
        COUNT(CASE WHEN status = 'completed' AND created_at >= current_month_start THEN 1 END)::INTEGER as monthly_consultations,
        COUNT(CASE WHEN status = 'completed' AND created_at >= current_week_start THEN 1 END)::INTEGER as weekly_consultations,
        COUNT(CASE WHEN status = 'completed' AND DATE(created_at) = current_day THEN 1 END)::INTEGER as daily_consultations,
        CASE 
            WHEN previous_month_earnings > 0 THEN 
                ((COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= current_month_start THEN net_amount ELSE 0 END), 0) - previous_month_earnings) / previous_month_earnings * 100)
            ELSE 0 
        END as monthly_growth_rate
    FROM operator_earnings 
    WHERE operator_id = p_operator_id;
END;
$$;

-- Function to get chart data for earnings over time
CREATE OR REPLACE FUNCTION get_operator_earnings_chart_data(p_operator_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    earnings DECIMAL(10,2),
    consultations INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * (p_days - 1),
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    )
    SELECT 
        ds.date,
        COALESCE(SUM(oe.net_amount), 0) as earnings,
        COUNT(oe.id)::INTEGER as consultations
    FROM date_series ds
    LEFT JOIN operator_earnings oe ON DATE(oe.created_at) = ds.date 
        AND oe.operator_id = p_operator_id 
        AND oe.status = 'completed'
    GROUP BY ds.date
    ORDER BY ds.date;
END;
$$;

-- Function to get recent transactions
CREATE OR REPLACE FUNCTION get_operator_recent_transactions(p_operator_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    service_type VARCHAR(20),
    gross_amount DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    duration_minutes INTEGER,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oe.id,
        oe.service_type,
        oe.gross_amount,
        oe.commission_amount,
        oe.net_amount,
        oe.duration_minutes,
        oe.status,
        oe.created_at
    FROM operator_earnings oe
    WHERE oe.operator_id = p_operator_id
    ORDER BY oe.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Function to record new earning
CREATE OR REPLACE FUNCTION record_operator_earning(
    p_operator_id UUID,
    p_service_type VARCHAR(20),
    p_gross_amount DECIMAL(10,2),
    p_duration_minutes INTEGER DEFAULT NULL,
    p_consultation_id UUID DEFAULT NULL,
    p_commission_rate DECIMAL(5,4) DEFAULT 0.15
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    earning_id UUID;
BEGIN
    INSERT INTO operator_earnings (
        operator_id,
        consultation_id,
        service_type,
        gross_amount,
        commission_rate,
        duration_minutes
    ) VALUES (
        p_operator_id,
        p_consultation_id,
        p_service_type,
        p_gross_amount,
        p_commission_rate,
        p_duration_minutes
    ) RETURNING id INTO earning_id;
    
    RETURN earning_id;
END;
$$;

-- Insert sample data for testing
DO $$
DECLARE
    sample_operator_id UUID;
    i INTEGER;
    random_service TEXT;
    random_amount DECIMAL(10,2);
    random_duration INTEGER;
    random_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get a sample operator ID (first operator in the system)
    SELECT id INTO sample_operator_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'operator' 
    LIMIT 1;
    
    -- Only insert if we have an operator
    IF sample_operator_id IS NOT NULL THEN
        -- Insert 50 sample earnings records over the last 60 days
        FOR i IN 1..50 LOOP
            -- Random service type
            random_service := (ARRAY['chat', 'call', 'written'])[floor(random() * 3 + 1)];
            
            -- Random amount based on service type
            random_amount := CASE random_service
                WHEN 'chat' THEN (random() * 40 + 10)::DECIMAL(10,2) -- 10-50 EUR
                WHEN 'call' THEN (random() * 60 + 20)::DECIMAL(10,2) -- 20-80 EUR
                WHEN 'written' THEN (random() * 80 + 30)::DECIMAL(10,2) -- 30-110 EUR
            END;
            
            -- Random duration for timed services
            random_duration := CASE random_service
                WHEN 'chat' THEN floor(random() * 45 + 15)::INTEGER -- 15-60 minutes
                WHEN 'call' THEN floor(random() * 30 + 10)::INTEGER -- 10-40 minutes
                ELSE NULL -- No duration for written
            END;
            
            -- Random date in the last 60 days
            random_date := NOW() - (random() * INTERVAL '60 days');
            
            INSERT INTO operator_earnings (
                operator_id,
                service_type,
                gross_amount,
                duration_minutes,
                created_at,
                updated_at
            ) VALUES (
                sample_operator_id,
                random_service,
                random_amount,
                random_duration,
                random_date,
                random_date
            );
        END LOOP;
        
        RAISE NOTICE 'Inserted 50 sample earnings records for operator %', sample_operator_id;
    ELSE
        RAISE NOTICE 'No operator found to insert sample data';
    END IF;
END;
$$;

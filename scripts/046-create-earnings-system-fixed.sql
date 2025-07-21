-- Create earnings and transactions tables for operators
CREATE TABLE IF NOT EXISTS operator_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('chat', 'call', 'written')),
    gross_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    platform_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.15, -- 15% default commission
    duration_minutes INTEGER DEFAULT NULL, -- For chat/call services
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_earnings_operator_id ON operator_earnings(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_created_at ON operator_earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_status ON operator_earnings(status);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_service_type ON operator_earnings(service_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_operator_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_operator_earnings_updated_at
    BEFORE UPDATE ON operator_earnings
    FOR EACH ROW
    EXECUTE FUNCTION update_operator_earnings_updated_at();

-- RLS Policies
ALTER TABLE operator_earnings ENABLE ROW LEVEL SECURITY;

-- Operators can only see their own earnings
CREATE POLICY "Operators can view own earnings" ON operator_earnings
    FOR SELECT USING (
        auth.uid() = operator_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only system can insert earnings (through functions)
CREATE POLICY "System can insert earnings" ON operator_earnings
    FOR INSERT WITH CHECK (true);

-- Function to record operator earnings
CREATE OR REPLACE FUNCTION record_operator_earning(
    p_operator_id UUID,
    p_service_type TEXT,
    p_gross_amount DECIMAL,
    p_consultation_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_commission_rate DECIMAL(5,4);
    v_platform_commission DECIMAL(10,2);
    v_net_amount DECIMAL(10,2);
    v_earning_id UUID;
BEGIN
    -- Get operator's commission rate
    SELECT COALESCE(commission_rate, 0.15) INTO v_commission_rate
    FROM profiles 
    WHERE id = p_operator_id;
    
    -- Calculate commission and net amount
    v_platform_commission := p_gross_amount * v_commission_rate;
    v_net_amount := p_gross_amount - v_platform_commission;
    
    -- Insert earning record
    INSERT INTO operator_earnings (
        operator_id,
        consultation_id,
        service_type,
        gross_amount,
        platform_commission,
        net_amount,
        commission_rate,
        duration_minutes,
        status
    ) VALUES (
        p_operator_id,
        p_consultation_id,
        p_service_type,
        p_gross_amount,
        v_platform_commission,
        v_net_amount,
        v_commission_rate,
        p_duration_minutes,
        'completed'
    ) RETURNING id INTO v_earning_id;
    
    RETURN v_earning_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get operator earnings summary
CREATE OR REPLACE FUNCTION get_operator_earnings_summary(p_operator_id UUID)
RETURNS TABLE (
    total_earnings DECIMAL,
    monthly_earnings DECIMAL,
    weekly_earnings DECIMAL,
    daily_earnings DECIMAL,
    total_consultations INTEGER,
    monthly_consultations INTEGER,
    weekly_consultations INTEGER,
    daily_consultations INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END), 0) as total_earnings,
        COALESCE(SUM(CASE 
            WHEN status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE) 
            THEN net_amount ELSE 0 
        END), 0) as monthly_earnings,
        COALESCE(SUM(CASE 
            WHEN status = 'completed' AND created_at >= date_trunc('week', CURRENT_DATE) 
            THEN net_amount ELSE 0 
        END), 0) as weekly_earnings,
        COALESCE(SUM(CASE 
            WHEN status = 'completed' AND created_at >= CURRENT_DATE 
            THEN net_amount ELSE 0 
        END), 0) as daily_earnings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as total_consultations,
        COUNT(CASE 
            WHEN status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE) 
            THEN 1 
        END)::INTEGER as monthly_consultations,
        COUNT(CASE 
            WHEN status = 'completed' AND created_at >= date_trunc('week', CURRENT_DATE) 
            THEN 1 
        END)::INTEGER as weekly_consultations,
        COUNT(CASE 
            WHEN status = 'completed' AND created_at >= CURRENT_DATE 
            THEN 1 
        END)::INTEGER as daily_consultations
    FROM operator_earnings
    WHERE operator_id = p_operator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get operator earnings chart data
CREATE OR REPLACE FUNCTION get_operator_earnings_chart_data(
    p_operator_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    earnings DECIMAL,
    consultations INTEGER
) AS $$
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
    LEFT JOIN operator_earnings oe ON 
        DATE(oe.created_at) = ds.date 
        AND oe.operator_id = p_operator_id 
        AND oe.status = 'completed'
    GROUP BY ds.date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent operator transactions
CREATE OR REPLACE FUNCTION get_operator_recent_transactions(
    p_operator_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    service_type TEXT,
    gross_amount DECIMAL,
    platform_commission DECIMAL,
    net_amount DECIMAL,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    consultation_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oe.id,
        oe.service_type,
        oe.gross_amount,
        oe.platform_commission,
        oe.net_amount,
        oe.duration_minutes,
        oe.created_at,
        oe.consultation_id
    FROM operator_earnings oe
    WHERE oe.operator_id = p_operator_id
        AND oe.status = 'completed'
    ORDER BY oe.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
DO $$
DECLARE
    operator_record RECORD;
    i INTEGER;
    random_amount DECIMAL;
    random_service TEXT;
    random_date TIMESTAMP;
BEGIN
    -- Get first operator for sample data
    SELECT id INTO operator_record FROM profiles WHERE role = 'operator' LIMIT 1;
    
    IF operator_record.id IS NOT NULL THEN
        -- Insert sample earnings for the last 30 days
        FOR i IN 1..50 LOOP
            -- Random service type
            random_service := (ARRAY['chat', 'call', 'written'])[floor(random() * 3 + 1)];
            
            -- Random amount based on service type
            random_amount := CASE 
                WHEN random_service = 'written' THEN (random() * 40 + 10)::DECIMAL(10,2)
                ELSE (random() * 30 + 5)::DECIMAL(10,2)
            END;
            
            -- Random date in last 30 days
            random_date := NOW() - INTERVAL '1 day' * (random() * 30);
            
            INSERT INTO operator_earnings (
                operator_id,
                service_type,
                gross_amount,
                platform_commission,
                net_amount,
                commission_rate,
                duration_minutes,
                status,
                created_at
            ) VALUES (
                operator_record.id,
                random_service,
                random_amount,
                random_amount * 0.15,
                random_amount * 0.85,
                0.15,
                CASE WHEN random_service != 'written' THEN (random() * 60 + 10)::INTEGER ELSE NULL END,
                'completed',
                random_date
            );
        END LOOP;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON operator_earnings TO authenticated;
GRANT EXECUTE ON FUNCTION record_operator_earning TO authenticated;
GRANT EXECUTE ON FUNCTION get_operator_earnings_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_operator_earnings_chart_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_operator_recent_transactions TO authenticated;

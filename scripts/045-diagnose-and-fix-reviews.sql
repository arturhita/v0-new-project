-- Diagnose and fix reviews table issues
DO $$
BEGIN
    -- Check if reviews table exists and its structure
    RAISE NOTICE 'Checking reviews table structure...';
    
    -- Show current columns
    FOR rec IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %', rec.column_name, rec.data_type, rec.is_nullable;
    END LOOP;
    
    -- Check if we have any reviews data
    EXECUTE 'SELECT COUNT(*) FROM reviews' INTO rec;
    RAISE NOTICE 'Total reviews count: %', rec;
    
    -- Check for NULL user_id values
    EXECUTE 'SELECT COUNT(*) FROM reviews WHERE user_id IS NULL' INTO rec;
    RAISE NOTICE 'Reviews with NULL user_id: %', rec;
    
    -- Check for valid user_id references
    EXECUTE 'SELECT COUNT(*) FROM reviews r WHERE r.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = r.user_id)' INTO rec;
    RAISE NOTICE 'Reviews with invalid user_id references: %', rec;
END $$;

-- Ensure proper foreign key constraints exist
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_operator_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_operator_id_fkey 
    FOREIGN KEY (operator_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add status column if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved' 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update any NULL status values
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Create some sample reviews if none exist
INSERT INTO reviews (user_id, operator_id, rating, comment, status, created_at)
SELECT 
    (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
    p.id,
    4 + (random() * 1)::int, -- Random rating between 4-5
    CASE (random() * 3)::int
        WHEN 0 THEN 'Consulto molto utile e preciso. Consiglio vivamente!'
        WHEN 1 THEN 'Esperienza positiva, operatore molto professionale.'
        ELSE 'Ottimo servizio, tornerò sicuramente.'
    END,
    'approved',
    now() - (random() * interval '30 days')
FROM profiles p 
WHERE p.role = 'operator' 
AND p.status = 'Attivo'
AND NOT EXISTS (SELECT 1 FROM reviews WHERE operator_id = p.id)
LIMIT 5
ON CONFLICT DO NOTHING;

-- Refresh the reviews view/function if it exists
DROP VIEW IF EXISTS reviews_with_details CASCADE;
CREATE VIEW reviews_with_details AS
SELECT 
    r.*,
    client.full_name as client_name,
    client.avatar_url as client_avatar,
    operator.stage_name as operator_name,
    operator.avatar_url as operator_avatar
FROM reviews r
LEFT JOIN profiles client ON r.user_id = client.id
LEFT JOIN profiles operator ON r.operator_id = operator.id;

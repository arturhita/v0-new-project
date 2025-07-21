-- Diagnostic script to check and fix reviews table structure
DO $$
BEGIN
    -- Check if reviews table exists and its structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        RAISE NOTICE 'Reviews table exists';
        
        -- Check columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
            RAISE NOTICE 'user_id column exists';
        ELSE
            RAISE NOTICE 'user_id column missing - adding it';
            ALTER TABLE reviews ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'client_id') THEN
            RAISE NOTICE 'client_id column exists - will migrate data if needed';
            -- Migrate data from client_id to user_id if user_id is empty
            UPDATE reviews SET user_id = client_id WHERE user_id IS NULL AND client_id IS NOT NULL;
        END IF;
        
        -- Ensure operator_id exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'operator_id') THEN
            ALTER TABLE reviews ADD COLUMN operator_id UUID REFERENCES auth.users(id);
        END IF;
        
        -- Ensure other required columns exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'rating') THEN
            ALTER TABLE reviews ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'comment') THEN
            ALTER TABLE reviews ADD COLUMN comment TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'status') THEN
            ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'created_at') THEN
            ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'updated_at') THEN
            ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
    ELSE
        RAISE NOTICE 'Reviews table does not exist - creating it';
        CREATE TABLE reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            operator_id UUID REFERENCES auth.users(id),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view approved reviews" ON reviews
            FOR SELECT USING (status = 'approved');
            
        CREATE POLICY "Users can create reviews" ON reviews
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own reviews" ON reviews
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    RAISE NOTICE 'Reviews table structure check complete';
END $$;

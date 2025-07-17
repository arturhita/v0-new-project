-- Create operator_status_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status_enum') THEN
        CREATE TYPE operator_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
END$$;

-- Create service_type_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type_enum') THEN
        CREATE TYPE service_type_enum AS ENUM ('chat', 'call', 'video', 'written_consultation');
    END IF;
END$$;

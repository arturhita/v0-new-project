-- Create structure for operator services and pricing
-- Update profiles table to include services configuration

-- Add services column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '{
  "chat": {
    "enabled": false,
    "price_per_minute": 1.0
  },
  "call": {
    "enabled": false,
    "price_per_minute": 1.5
  },
  "email": {
    "enabled": false,
    "price": 25.0
  },
  "min_duration": 10
}'::JSONB;

-- Create function to update operator services
CREATE OR REPLACE FUNCTION update_operator_services(
  operator_id UUID,
  new_services JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validate that the operator exists and is authorized
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = operator_id AND role = 'operator' AND auth.uid() = id
  ) THEN
    RAISE EXCEPTION 'Operator not found or unauthorized';
  END IF;

  -- Update the services for the operator
  UPDATE profiles 
  SET 
    services = new_services,
    updated_at = NOW()
  WHERE id = operator_id AND role = 'operator'
  RETURNING services INTO result;
  
  RETURN result;
END;
$$;

-- Create function to get operator services
CREATE OR REPLACE FUNCTION get_operator_services(operator_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT services INTO result
  FROM profiles 
  WHERE id = operator_id AND role = 'operator';
  
  IF result IS NULL THEN
    RETURN '{
      "chat": {
        "enabled": false,
        "price_per_minute": 1.0
      },
      "call": {
        "enabled": false,
        "price_per_minute": 1.5
      },
      "email": {
        "enabled": false,
        "price": 25.0
      },
      "min_duration": 10
    }'::JSONB;
  END IF;
  
  RETURN result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_operator_services(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_operator_services(UUID) TO authenticated;

-- Update RLS policies to allow operators to update their services
CREATE POLICY "Operators can update their own services" ON profiles
  FOR UPDATE USING (auth.uid() = id AND role = 'operator');

-- Create index for better performance on services queries
CREATE INDEX IF NOT EXISTS idx_profiles_services ON profiles USING GIN (services);

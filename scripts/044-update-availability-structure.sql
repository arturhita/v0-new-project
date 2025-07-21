-- Update the availability structure in profiles table to match the new format
-- and create functions to handle availability operations

-- First, let's ensure the availability column exists and has the right structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

-- Create a function to update operator availability
CREATE OR REPLACE FUNCTION update_operator_availability(
  operator_id UUID,
  new_availability JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the availability for the operator
  UPDATE profiles 
  SET 
    availability = new_availability,
    updated_at = NOW()
  WHERE id = operator_id AND role = 'operator'
  RETURNING availability INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Operator not found or unauthorized';
  END IF;
  
  RETURN result;
END;
$$;

-- Create a function to get operator availability
CREATE OR REPLACE FUNCTION get_operator_availability(operator_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT availability INTO result
  FROM profiles 
  WHERE id = operator_id AND role = 'operator';
  
  IF result IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;
  
  RETURN result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_operator_availability(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_operator_availability(UUID) TO authenticated;

-- Create RLS policies for availability updates
CREATE POLICY "Operators can update their own availability" ON profiles
  FOR UPDATE USING (auth.uid() = id AND role = 'operator');

CREATE POLICY "Operators can view their own availability" ON profiles
  FOR SELECT USING (auth.uid() = id AND role = 'operator');

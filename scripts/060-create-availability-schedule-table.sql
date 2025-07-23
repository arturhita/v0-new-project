-- Drop the old availability column from profiles if it exists, as we are replacing it with a structured table.
ALTER TABLE profiles
DROP COLUMN IF EXISTS availability;

-- Create a table to store the recurring weekly availability for each operator.
CREATE TABLE IF NOT EXISTS operator_availability_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Day of the week, where 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
    day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure an operator can only have one schedule entry per day of the week.
    UNIQUE(operator_id, day_of_week)
);

-- Add RLS policies to the new table.
ALTER TABLE operator_availability_schedules ENABLE ROW LEVEL SECURITY;

-- Operators can view and manage their own availability schedules.
CREATE POLICY "Operators can view and manage their own schedules"
ON operator_availability_schedules
FOR ALL
USING (auth.uid() = operator_id)
WITH CHECK (auth.uid() = operator_id);

-- Admins can do anything.
CREATE POLICY "Admins can manage all schedules"
ON operator_availability_schedules
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Function to create a default schedule for a new operator.
CREATE OR REPLACE FUNCTION public.create_default_schedule_for_new_operator()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a default schedule for each day of the week (Monday to Sunday).
  -- By default, the operator is not available.
  INSERT INTO public.operator_availability_schedules (operator_id, day_of_week, is_available, start_time, end_time)
  SELECT NEW.id, i, false, '09:00:00', '17:00:00'
  FROM generate_series(1, 7) i;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create the default schedule when a new profile is created.
-- We need to drop the old trigger if it exists to avoid conflicts.
DROP TRIGGER IF EXISTS on_new_profile_create_default_schedule ON public.profiles;
CREATE TRIGGER on_new_profile_create_default_schedule
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'operator')
  EXECUTE FUNCTION public.create_default_schedule_for_new_operator();

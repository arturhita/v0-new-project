-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS create_user_profile;

-- Create a new trigger to automatically create a user profile after a new user is created
CREATE TRIGGER create_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW
BEGIN
INSERT INTO public.profiles (id, updated_at, username, full_name, avatar_url, website)
VALUES (NEW.id, NOW(), NEW.raw_user_meta_data->>'username', '', '', '');
END;

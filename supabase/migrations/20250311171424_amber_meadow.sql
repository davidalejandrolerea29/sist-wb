/*
  # Add user roles and permissions

  1. Changes
    - Add role column to auth.users
    - Add role-based policies for news table

  2. Security
    - Add policies for editor and admin roles
    - Editors can create and edit their own news
    - Admins can manage all news
*/

-- Add role column to auth.users via custom claims
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Set default role as 'editor'
  NEW.raw_app_meta_data := jsonb_set(
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"editor"'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing policies
DROP POLICY IF EXISTS "Users can create news" ON news;
DROP POLICY IF EXISTS "Users can update their own news" ON news;
DROP POLICY IF EXISTS "Users can delete their own news" ON news;

-- Create new role-based policies
CREATE POLICY "Editors can create news"
  ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('editor', 'admin')
  );

CREATE POLICY "Editors can update their own news"
  ON news
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role' IN ('editor', 'admin') AND auth.uid() = user_id)
    OR
    (auth.jwt()->>'role' = 'admin')
  )
  WITH CHECK (
    (auth.jwt()->>'role' IN ('editor', 'admin') AND auth.uid() = user_id)
    OR
    (auth.jwt()->>'role' = 'admin')
  );

CREATE POLICY "Editors and admins can delete their own news"
  ON news
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role' IN ('editor', 'admin') AND auth.uid() = user_id)
    OR
    (auth.jwt()->>'role' = 'admin')
  );
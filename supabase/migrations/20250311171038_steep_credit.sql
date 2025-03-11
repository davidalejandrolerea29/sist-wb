/*
  # Create news table

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `category` (text, required)
      - `excerpt` (text, required)
      - `content` (text, required)
      - `image_url` (text, required)
      - `created_at` (timestamp with timezone)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `news` table
    - Add policies for:
      - Public can read all news
      - Authenticated users can create/update/delete their own news
*/

CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "News are viewable by everyone"
  ON news
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create news
CREATE POLICY "Users can create news"
  ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own news
CREATE POLICY "Users can update their own news"
  ON news
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own news
CREATE POLICY "Users can delete their own news"
  ON news
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
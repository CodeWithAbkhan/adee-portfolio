/*
  # Community System Schema

  1. New Tables
    - profiles
      - User profile information including verification status
    - posts
      - Community posts with file/link sharing
    - storage_cleanup
      - Track storage usage for cleanup

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin access

  3. Storage
    - Create buckets for avatars, community files, and verification
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text,
  avatar_url text,
  mobile text,
  portfolio_link text,
  country text,
  nic_image_url text,
  is_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  file_url text,
  type text NOT NULL CHECK (type IN ('file', 'link')),
  created_at timestamptz DEFAULT now()
);

-- Create storage_cleanup table
CREATE TABLE IF NOT EXISTS storage_cleanup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_name text NOT NULL,
  total_size bigint DEFAULT 0,
  last_cleanup timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_cleanup ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage cleanup policies
CREATE POLICY "Only admins can access storage cleanup"
  ON storage_cleanup
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES 
  ('avatars', 'avatars'),
  ('community-files', 'community-files'),
  ('verification', 'verification');

-- Storage bucket policies
CREATE POLICY "Avatar access"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Community files access"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'community-files');

CREATE POLICY "Verification files admin access"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification' AND (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_admin = true
      )
    )
  );

-- Function to clean up storage when limit reached
CREATE OR REPLACE FUNCTION cleanup_storage()
RETURNS trigger AS $$
BEGIN
  -- Check if total storage is over 700MB
  IF (
    SELECT SUM(metadata->>'size')::bigint 
    FROM storage.objects
    WHERE bucket_id = 'community-files'
  ) > 734003200 THEN -- 700MB in bytes
    -- Delete oldest files until under limit
    DELETE FROM storage.objects
    WHERE id IN (
      SELECT id
      FROM storage.objects
      WHERE bucket_id = 'community-files'
      ORDER BY created_at ASC
      LIMIT 10
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for storage cleanup
CREATE TRIGGER cleanup_storage_trigger
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'community-files')
EXECUTE FUNCTION cleanup_storage();
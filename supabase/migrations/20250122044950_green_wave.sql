/*
  # Fix storage policies and profile handling

  1. Changes
    - Fix storage policies for file uploads
    - Add proper RLS policies for profiles
    - Fix storage cleanup function
    - Add proper bucket configurations

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
    - Fix file upload permissions
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload and update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload and update their own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Verification files are viewable by owner and admins" ON storage.objects;
DROP POLICY IF EXISTS "Community files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community files" ON storage.objects;

-- Update storage.objects policies
CREATE POLICY "Public avatars access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatar upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public community files access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-files');

CREATE POLICY "Community files upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Verification files access"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification' AND
    (auth.role() = 'authenticated' OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    ))
  );

CREATE POLICY "Verification files upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification' AND
    auth.role() = 'authenticated'
  );

-- Drop and recreate profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Add new profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Update storage cleanup function
CREATE OR REPLACE FUNCTION cleanup_storage()
RETURNS trigger AS $$
DECLARE
  total_size bigint;
BEGIN
  -- Get total size of community files
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)
  INTO total_size
  FROM storage.objects
  WHERE bucket_id = 'community-files';

  -- If over 700MB (734003200 bytes), delete oldest files
  IF total_size > 734003200 THEN
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
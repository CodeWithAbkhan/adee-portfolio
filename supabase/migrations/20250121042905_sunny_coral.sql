/*
  # Fix RLS Policies

  1. Changes
    - Add policies for profile creation during signup
    - Fix storage policies for avatars and community files
    - Add policies for authenticated users to update their own profiles
    - Add policies for file uploads

  2. Security
    - Maintain strict RLS while allowing necessary operations
    - Ensure users can only modify their own data
    - Allow public read access where appropriate
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Community files access" ON storage.objects;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Storage policies
CREATE POLICY "Avatar files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Community files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-files');

CREATE POLICY "Authenticated users can upload community files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-files' AND
    auth.role() = 'authenticated'
  );

-- Update verification files policy
CREATE POLICY "Users can upload their own verification files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own verification files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification' AND
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );
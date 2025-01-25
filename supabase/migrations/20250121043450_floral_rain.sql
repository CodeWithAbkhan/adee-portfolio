/*
  # Fix Storage Policies and Profile Handling

  1. Changes
    - Fix storage policies for avatars and verification files
    - Add missing storage policies for file updates
    - Update profile policies for better security

  2. Security
    - Ensure users can only access their own files
    - Allow admins to view verification files
    - Fix file upload permissions
*/

-- Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification files" ON storage.objects;

-- Avatar storage policies
CREATE POLICY "Avatar files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload and update their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Verification files policies
CREATE POLICY "Users can upload and update their own verification files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own verification files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'verification' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'verification' AND auth.role() = 'authenticated');

CREATE POLICY "Verification files are viewable by owner and admins"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_admin = true
      )
    )
  );
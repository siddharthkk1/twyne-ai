
-- Create a storage policy for the avatar-images bucket that allows authenticated users to read the files
CREATE POLICY "Authenticated users can view avatar images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatar-images' 
    AND auth.role() = 'authenticated'
  );


-- Make the avatar-images bucket public so images can be accessed via direct URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatar-images';

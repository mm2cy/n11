/*
  # Storage Setup for MultiTalk Application

  1. Storage Buckets
    - `user-uploads` - For storing user uploaded audio and image files
    - `generated-videos` - For storing generated video files

  2. Storage Policies
    - Users can upload files to their own folder
    - Users can read their own files
    - Public access for completed videos (optional)
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('user-uploads', 'user-uploads', false),
  ('generated-videos', 'generated-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for user-uploads bucket
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own uploads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policies for generated-videos bucket
CREATE POLICY "Anyone can view generated videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'generated-videos');

CREATE POLICY "Service role can manage generated videos"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'generated-videos');
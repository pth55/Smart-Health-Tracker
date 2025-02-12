/*
  # Update storage policies for medical documents

  1. Changes
    - Add storage policies for downloading files
    - Update existing policies for better security
  
  2. Security
    - Enable policies for authenticated users
    - Restrict access to user's own files
*/

-- Update storage policies for medical-documents bucket
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create new comprehensive policies
CREATE POLICY "Enable download for users based on user_id"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Enable upload for users based on user_id"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Enable delete for users based on user_id"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
/*
  # Document storage improvements

  1. Changes
    - Add document_path column to medical_documents table
    - Create storage bucket for medical documents
    - Set up storage bucket policies

  2. Security
    - Enable RLS for storage bucket
    - Add policies for authenticated users
*/

-- Add document_path column
ALTER TABLE medical_documents
ADD COLUMN IF NOT EXISTS document_path TEXT NOT NULL;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
/*
  # Fix profile constraints and add missing indexes

  1. Changes
    - Add missing indexes for foreign key columns
    - Add cascade delete for related records
    - Add default values for required fields
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add indexes for foreign key columns
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_records_user_id ON vital_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON medical_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON vaccinations(user_id);

-- Update foreign key constraints to cascade delete
ALTER TABLE medical_documents 
  DROP CONSTRAINT IF EXISTS medical_documents_user_id_fkey,
  ADD CONSTRAINT medical_documents_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE vital_records 
  DROP CONSTRAINT IF EXISTS vital_records_user_id_fkey,
  ADD CONSTRAINT vital_records_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE medications 
  DROP CONSTRAINT IF EXISTS medications_user_id_fkey,
  ADD CONSTRAINT medications_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE medical_conditions 
  DROP CONSTRAINT IF EXISTS medical_conditions_user_id_fkey,
  ADD CONSTRAINT medical_conditions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE vaccinations 
  DROP CONSTRAINT IF EXISTS vaccinations_user_id_fkey,
  ADD CONSTRAINT vaccinations_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

-- Add default values for required fields in profiles
ALTER TABLE profiles
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();
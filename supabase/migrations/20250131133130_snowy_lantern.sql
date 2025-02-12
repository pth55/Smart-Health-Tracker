/*
  # Health Records Management System Schema

  1. New Tables
    - profiles
      - Basic user information and health details
      - Linked to auth.users
    - medical_documents
      - Stores document metadata
      - Documents stored in Supabase Storage
    - vital_records
      - Daily health tracking data
    - medications
      - Current and past medications
    - medical_conditions
      - Diagnosed conditions
    - vaccinations
      - Vaccination records

  2. Security
    - RLS enabled on all tables
    - Policies for user data access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  aadhar_number TEXT UNIQUE,
  phone_number TEXT UNIQUE NOT NULL,
  blood_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medical documents table
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Vital records table
CREATE TABLE IF NOT EXISTS vital_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  blood_sugar DECIMAL(5,2),
  heart_rate INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Medical conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE NOT NULL,
  status TEXT NOT NULL,
  notes TEXT
);

-- Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  vaccine_name TEXT NOT NULL,
  dose_number INTEGER NOT NULL,
  administered_date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own documents"
  ON medical_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents"
  ON medical_documents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vitals"
  ON vital_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own vitals"
  ON vital_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medications"
  ON medications FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conditions"
  ON medical_conditions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conditions"
  ON medical_conditions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vaccinations"
  ON vaccinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own vaccinations"
  ON vaccinations FOR ALL
  USING (auth.uid() = user_id);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_updated();
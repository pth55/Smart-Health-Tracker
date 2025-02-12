export interface Profile {
  id: string;
  full_name: string;
  date_of_birth: string;
  weight?: number;
  height?: number;
  aadhar_number?: string;
  phone_number: string;
  blood_type?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  category: string;
  document_url: string;
  document_path: string;
  uploaded_at: string;
  notes?: string;
}

export interface VitalRecord {
  id: string;
  user_id: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  blood_sugar?: number;
  heart_rate?: number;
  recorded_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  active: boolean;
  notes?: string;
}

export interface MedicalCondition {
  id: string;
  user_id: string;
  condition_name: string;
  diagnosed_date: string;
  status: string;
  notes?: string;
}

export interface Vaccination {
  id: string;
  user_id: string;
  vaccine_name: string;
  dose_number: number;
  administered_date: string;
  next_due_date?: string;
  notes?: string;
}
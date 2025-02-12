export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          date_of_birth: string
          weight?: number
          height?: number
          aadhar_number?: string
          phone_number: string
          blood_type?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          date_of_birth: string
          weight?: number
          height?: number
          aadhar_number?: string
          phone_number: string
          blood_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          date_of_birth?: string
          weight?: number
          height?: number
          aadhar_number?: string
          phone_number?: string
          blood_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      medical_documents: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          document_url: string
          document_path: string
          uploaded_at: string
          notes?: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          document_url: string
          document_path: string
          uploaded_at?: string
          notes?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          document_url?: string
          document_path?: string
          uploaded_at?: string
          notes?: string
        }
      }
      vital_records: {
        Row: {
          id: string
          user_id: string
          blood_pressure_systolic?: number
          blood_pressure_diastolic?: number
          blood_sugar?: number
          heart_rate?: number
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blood_pressure_systolic?: number
          blood_pressure_diastolic?: number
          blood_sugar?: number
          heart_rate?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blood_pressure_systolic?: number
          blood_pressure_diastolic?: number
          blood_sugar?: number
          heart_rate?: number
          recorded_at?: string
        }
      }
    }
    storage: {
      buckets: {
        Row: {
          id: string
          name: string
          public: boolean
        }
      }
      objects: {
        Row: {
          bucket_id: string
          name: string
          owner: string
          size: number
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }
      }
    }
  }
}
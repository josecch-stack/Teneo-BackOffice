// AUTO-GENERATED — but NOT via the official `supabase gen types typescript` CLI.
// That command requires a local Docker/Podman container for introspection
// (even with --db-url), and neither is available in this environment
// (virtualization is disabled — see docs/schema-discovery.md section 10).
//
// Generated instead by scripts/introspect against the live database's
// information_schema/pg_catalog — same source of truth, same output shape.
// Regenerate with the real CLI once Docker or a Management API access token
// is available: `supabase gen types typescript --db-url "$SUPABASE_DB_URL" --schema public > types/database.types.ts`
// Generated: 2026-08-13

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: Database["public"]["Enums"]["panel_role"] | null;
          action: string;
          resource: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["panel_role"] | null;
          action: string;
          resource: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["panel_role"] | null;
          action?: string;
          resource?: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clinical_notes: {
        Row: {
          id: string;
          pet_id: string;
          event_type: Database["public"]["Enums"]["clinical_event_type"] | null;
          event_date: string;
          notes_diagnosis: string;
          has_prescription: boolean | null;
          created_at: string;
          updated_at: string;
          reason: string | null;
          veterinarian: string | null;
          clinic: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          event_type?:
            Database["public"]["Enums"]["clinical_event_type"] | null;
          event_date: string;
          notes_diagnosis: string;
          has_prescription?: boolean | null;
          created_at?: string;
          updated_at?: string;
          reason?: string | null;
          veterinarian?: string | null;
          clinic?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pet_id?: string;
          event_type?:
            Database["public"]["Enums"]["clinical_event_type"] | null;
          event_date?: string;
          notes_diagnosis?: string;
          has_prescription?: boolean | null;
          created_at?: string;
          updated_at?: string;
          reason?: string | null;
          veterinarian?: string | null;
          clinic?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_notes_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      communes: {
        Row: {
          id: number;
          region_id: number;
          name: string;
        };
        Insert: {
          id?: number;
          region_id: number;
          name: string;
        };
        Update: {
          id?: number;
          region_id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communes_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      dewormings: {
        Row: {
          id: string;
          pet_id: string;
          type: Database["public"]["Enums"]["deworming_type"];
          product: string;
          application_date: string;
          next_dose_date: string | null;
          weight_kg: number | null;
          dosage: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          type: Database["public"]["Enums"]["deworming_type"];
          product: string;
          application_date: string;
          next_dose_date?: string | null;
          weight_kg?: number | null;
          dosage?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pet_id?: string;
          type?: Database["public"]["Enums"]["deworming_type"];
          product?: string;
          application_date?: string;
          next_dose_date?: string | null;
          weight_kg?: number | null;
          dosage?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dewormings_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      imaging_exam_files: {
        Row: {
          id: string;
          imaging_exam_id: string;
          file_url: string;
          file_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          imaging_exam_id: string;
          file_url: string;
          file_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          imaging_exam_id?: string;
          file_url?: string;
          file_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "imaging_exam_files_imaging_exam_id_fkey";
            columns: ["imaging_exam_id"];
            isOneToOne: false;
            referencedRelation: "imaging_exams";
            referencedColumns: ["id"];
          },
        ];
      };
      imaging_exams: {
        Row: {
          id: string;
          pet_id: string;
          clinical_note_id: string | null;
          image_type: Database["public"]["Enums"]["imaging_type"];
          body_region: string | null;
          exam_date: string;
          vet_center: string | null;
          findings: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          clinical_note_id?: string | null;
          image_type: Database["public"]["Enums"]["imaging_type"];
          body_region?: string | null;
          exam_date: string;
          vet_center?: string | null;
          findings?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pet_id?: string;
          clinical_note_id?: string | null;
          image_type?: Database["public"]["Enums"]["imaging_type"];
          body_region?: string | null;
          exam_date?: string;
          vet_center?: string | null;
          findings?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "imaging_exams_clinical_note_id_fkey";
            columns: ["clinical_note_id"];
            isOneToOne: false;
            referencedRelation: "clinical_notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "imaging_exams_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      lab_catalog: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      lab_exam_files: {
        Row: {
          id: string;
          lab_exam_id: string;
          file_url: string;
          file_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_exam_id: string;
          file_url: string;
          file_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lab_exam_id?: string;
          file_url?: string;
          file_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lab_exam_files_lab_exam_id_fkey";
            columns: ["lab_exam_id"];
            isOneToOne: false;
            referencedRelation: "lab_exams";
            referencedColumns: ["id"];
          },
        ];
      };
      lab_exams: {
        Row: {
          id: string;
          pet_id: string;
          clinical_note_id: string | null;
          exam_name: string;
          category: Database["public"]["Enums"]["exam_category"];
          sample_date: string | null;
          result_date: string;
          lab_center: string | null;
          summary: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          clinical_note_id?: string | null;
          exam_name: string;
          category?: Database["public"]["Enums"]["exam_category"];
          sample_date?: string | null;
          result_date: string;
          lab_center?: string | null;
          summary?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pet_id?: string;
          clinical_note_id?: string | null;
          exam_name?: string;
          category?: Database["public"]["Enums"]["exam_category"];
          sample_date?: string | null;
          result_date?: string;
          lab_center?: string | null;
          summary?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lab_exams_clinical_note_id_fkey";
            columns: ["clinical_note_id"];
            isOneToOne: false;
            referencedRelation: "clinical_notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_exams_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      medications: {
        Row: {
          id: string;
          prescription_id: string;
          name: string;
          dosage: string | null;
          frequency_hours: number | null;
          duration_days: number | null;
          start_datetime: string | null;
          end_datetime: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prescription_id: string;
          name: string;
          dosage?: string | null;
          frequency_hours?: number | null;
          duration_days?: number | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prescription_id?: string;
          name?: string;
          dosage?: string | null;
          frequency_hours?: number | null;
          duration_days?: number | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medications_prescription_id_fkey";
            columns: ["prescription_id"];
            isOneToOne: false;
            referencedRelation: "prescriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          owner_id: string;
          pet_id: string;
          notification_type: Database["public"]["Enums"]["notification_type"];
          title: string;
          message: string;
          source_module: string | null;
          source_id: string | null;
          trigger_date: string;
          is_read: boolean | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          pet_id: string;
          notification_type: Database["public"]["Enums"]["notification_type"];
          title: string;
          message: string;
          source_module?: string | null;
          source_id?: string | null;
          trigger_date: string;
          is_read?: boolean | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          pet_id?: string;
          notification_type?: Database["public"]["Enums"]["notification_type"];
          title?: string;
          message?: string;
          source_module?: string | null;
          source_id?: string | null;
          trigger_date?: string;
          is_read?: boolean | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      owners: {
        Row: {
          user_id: string;
          name: string | null;
          rut: string | null;
          phone: string | null;
          email: string | null;
          region_id: number | null;
          commune_id: number | null;
          address: string | null;
          condo_building: string | null;
          apt_house: string | null;
          created_at: string;
          updated_at: string;
          first_name: string;
          last_name: string | null;
          fcm_token: string | null;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          rut?: string | null;
          phone?: string | null;
          email?: string | null;
          region_id?: number | null;
          commune_id?: number | null;
          address?: string | null;
          condo_building?: string | null;
          apt_house?: string | null;
          created_at?: string;
          updated_at?: string;
          first_name: string;
          last_name?: string | null;
          fcm_token?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          name?: string | null;
          rut?: string | null;
          phone?: string | null;
          email?: string | null;
          region_id?: number | null;
          commune_id?: number | null;
          address?: string | null;
          condo_building?: string | null;
          apt_house?: string | null;
          created_at?: string;
          updated_at?: string;
          first_name?: string;
          last_name?: string | null;
          fcm_token?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "owners_commune_id_fkey";
            columns: ["commune_id"];
            isOneToOne: false;
            referencedRelation: "communes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owners_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      panel_permissions: {
        Row: {
          id: number;
          resource: string;
          action: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          resource: string;
          action: string;
          description?: string | null;
        };
        Update: {
          id?: number;
          resource?: string;
          action?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      panel_role_permissions: {
        Row: {
          role: Database["public"]["Enums"]["panel_role"];
          permission_id: number;
        };
        Insert: {
          role: Database["public"]["Enums"]["panel_role"];
          permission_id: number;
        };
        Update: {
          role?: Database["public"]["Enums"]["panel_role"];
          permission_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "panel_role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "panel_permissions";
            referencedColumns: ["id"];
          },
        ];
      };
      panel_users: {
        Row: {
          user_id: string;
          role: Database["public"]["Enums"]["panel_role"];
          full_name: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role: Database["public"]["Enums"]["panel_role"];
          full_name: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: Database["public"]["Enums"]["panel_role"];
          full_name?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pet_shares: {
        Row: {
          id: string;
          pet_id: string;
          shared_by: string;
          shared_with_email: string;
          shared_with_user_id: string | null;
          accepted: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          shared_by: string;
          shared_with_email: string;
          shared_with_user_id?: string | null;
          accepted?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          shared_by?: string;
          shared_with_email?: string;
          shared_with_user_id?: string | null;
          accepted?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pet_shares_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pet_shares_shared_by_fkey";
            columns: ["shared_by"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "pet_shares_shared_with_user_id_fkey";
            columns: ["shared_with_user_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
        ];
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: Database["public"]["Enums"]["species_type"];
          custom_species: string | null;
          breed: string | null;
          birth_date: string;
          sex: Database["public"]["Enums"]["sex_type"] | null;
          color: string | null;
          weight_kg: number | null;
          is_sterilized: boolean | null;
          health_notes: string | null;
          chip_number: string | null;
          chip_certificate_url: string | null;
          vet_name: string | null;
          vet_phone: string | null;
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species?: Database["public"]["Enums"]["species_type"];
          custom_species?: string | null;
          breed?: string | null;
          birth_date: string;
          sex?: Database["public"]["Enums"]["sex_type"] | null;
          color?: string | null;
          weight_kg?: number | null;
          is_sterilized?: boolean | null;
          health_notes?: string | null;
          chip_number?: string | null;
          chip_certificate_url?: string | null;
          vet_name?: string | null;
          vet_phone?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: Database["public"]["Enums"]["species_type"];
          custom_species?: string | null;
          breed?: string | null;
          birth_date?: string;
          sex?: Database["public"]["Enums"]["sex_type"] | null;
          color?: string | null;
          weight_kg?: number | null;
          is_sterilized?: boolean | null;
          health_notes?: string | null;
          chip_number?: string | null;
          chip_certificate_url?: string | null;
          vet_name?: string | null;
          vet_phone?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          id: string;
          clinical_note_id: string;
          general_instructions: string | null;
          prescription_date: string | null;
          next_checkup_date: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinical_note_id: string;
          general_instructions?: string | null;
          prescription_date?: string | null;
          next_checkup_date?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clinical_note_id?: string;
          general_instructions?: string | null;
          prescription_date?: string | null;
          next_checkup_date?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinical_note_id_fkey";
            columns: ["clinical_note_id"];
            isOneToOne: false;
            referencedRelation: "clinical_notes";
            referencedColumns: ["id"];
          },
        ];
      };
      push_devices: {
        Row: {
          id: string;
          owner_id: string;
          fcm_token: string;
          platform: string | null;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          fcm_token: string;
          platform?: string | null;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          fcm_token?: string;
          platform?: string | null;
          created_at?: string;
          last_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_devices_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
        ];
      };
      regions: {
        Row: {
          id: number;
          name: string;
          code: string;
          ordinal: number;
        };
        Insert: {
          id?: number;
          name: string;
          code: string;
          ordinal: number;
        };
        Update: {
          id?: number;
          name?: string;
          code?: string;
          ordinal?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          owner_id: string;
          plan_name: string;
          status: Database["public"]["Enums"]["subscription_status"];
          start_date: string | null;
          end_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          payment_method:
            Database["public"]["Enums"]["subscription_payment_method"] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          plan_name?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          start_date?: string | null;
          end_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          payment_method?:
            Database["public"]["Enums"]["subscription_payment_method"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          plan_name?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          start_date?: string | null;
          end_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          payment_method?:
            Database["public"]["Enums"]["subscription_payment_method"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["user_id"];
          },
        ];
      };
      vaccine_catalog: {
        Row: {
          id: number;
          name: string;
          species: Database["public"]["Enums"]["species_type"] | null;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          species?: Database["public"]["Enums"]["species_type"] | null;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          species?: Database["public"]["Enums"]["species_type"] | null;
          description?: string | null;
        };
        Relationships: [];
      };
      vaccines: {
        Row: {
          id: string;
          pet_id: string;
          application_type:
            Database["public"]["Enums"]["vaccine_application_type"] | null;
          vaccine_name: string;
          application_date: string | null;
          next_dose_date: string | null;
          brand_lab: string | null;
          batch_code: string | null;
          vet_center: string | null;
          vet_name: string | null;
          receipt_url: string | null;
          created_at: string;
          vaccine_catalog_id: number | null;
          lab_catalog_id: number | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          application_type?:
            Database["public"]["Enums"]["vaccine_application_type"] | null;
          vaccine_name: string;
          application_date?: string | null;
          next_dose_date?: string | null;
          brand_lab?: string | null;
          batch_code?: string | null;
          vet_center?: string | null;
          vet_name?: string | null;
          receipt_url?: string | null;
          created_at?: string;
          vaccine_catalog_id?: number | null;
          lab_catalog_id?: number | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pet_id?: string;
          application_type?:
            Database["public"]["Enums"]["vaccine_application_type"] | null;
          vaccine_name?: string;
          application_date?: string | null;
          next_dose_date?: string | null;
          brand_lab?: string | null;
          batch_code?: string | null;
          vet_center?: string | null;
          vet_name?: string | null;
          receipt_url?: string | null;
          created_at?: string;
          vaccine_catalog_id?: number | null;
          lab_catalog_id?: number | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vaccines_lab_catalog_id_fkey";
            columns: ["lab_catalog_id"];
            isOneToOne: false;
            referencedRelation: "lab_catalog";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vaccines_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vaccines_vaccine_catalog_id_fkey";
            columns: ["vaccine_catalog_id"];
            isOneToOne: false;
            referencedRelation: "vaccine_catalog";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      calculate_medication_end: {
        Args: {
          p_start: string | null;
          p_frequency_hours: number | null;
          p_duration_days: number | null;
        };
        Returns: string;
      };
      calculate_next_vaccine_dose: {
        Args: {
          p_species: Database["public"]["Enums"]["species_type"] | null;
          p_application_type:
            Database["public"]["Enums"]["vaccine_application_type"] | null;
          p_application_date: string | null;
        };
        Returns: string;
      };
      can_view_pet: {
        Args: {
          p_pet_id: string | null;
        };
        Returns: boolean;
      };
      custom_access_token_hook: {
        Args: {
          event: Json | null;
        };
        Returns: Json;
      };
      generate_pending_notifications: {
        Args: {};
        Returns: undefined;
      };
      has_panel_permission: {
        Args: {
          permission: string | null;
        };
        Returns: boolean;
      };
      has_shared_access: {
        Args: {
          p_pet_id: string | null;
        };
        Returns: boolean;
      };
      is_pet_owner: {
        Args: {
          p_pet_id: string | null;
        };
        Returns: boolean;
      };
      trg_medication_end_datetime: {
        Args: {};
        Returns: unknown;
      };
      trg_vaccine_catalog_sync: {
        Args: {};
        Returns: unknown;
      };
      trg_vaccine_lab_sync: {
        Args: {};
        Returns: unknown;
      };
      trg_vaccine_next_dose: {
        Args: {};
        Returns: unknown;
      };
      update_updated_at: {
        Args: {};
        Returns: unknown;
      };
      validate_rut: {
        Args: {
          p_rut: string | null;
        };
        Returns: boolean;
      };
      write_audit_log: {
        Args: {
          p_action: string | null;
          p_resource: string | null;
          p_record_id: string | null;
          p_old_values: Json | null;
          p_new_values: Json | null;
          p_ip: string | null;
          p_user_agent: string | null;
        };
        Returns: undefined;
      };
    };
    Views: {
      calendar_events: {
        Row: {
          event_date: string | null;
          event_type: Database["public"]["Enums"]["calendar_event_type"] | null;
          title: string | null;
          pet_id: string | null;
          source_module: string | null;
          source_id: string | null;
        };
        Relationships: [];
      };
      panel_documents: {
        Row: {
          document_type: string | null;
          file_url: string | null;
          file_name: string | null;
          pet_id: string | null;
          pet_name: string | null;
          owner_id: string | null;
          owner_first_name: string | null;
          owner_last_name: string | null;
          source_module: string | null;
          source_id: string | null;
          created_at: string | null;
        };
        Relationships: [];
      };
      pet_clinical_history: {
        Row: {
          record_type: string | null;
          record_id: string | null;
          record_date: string | null;
          created_at: string | null;
          owner_id: string | null;
          pet_id: string | null;
          first_name: string | null;
          last_name: string | null;
          rut: string | null;
          phone: string | null;
          address: string | null;
          name: string | null;
          species: string | null;
          breed: string | null;
          custom_species: string | null;
          sex: string | null;
          birth_date: string | null;
          weight_kg: number | null;
          chip_number: string | null;
          profile_photo_url: string | null;
          application_date: string | null;
          vaccine_catalog_id: number | null;
          lab_catalog_id: number | null;
          next_dose_date: string | null;
          product: string | null;
          deworming_type: string | null;
          image_type: string | null;
          body_region: string | null;
          exam_date: string | null;
          findings: string | null;
          exam_name: string | null;
          category: string | null;
          sample_date: string | null;
          result_date: string | null;
          summary: string | null;
          event_type: string | null;
          event_date: string | null;
          notes_diagnosis: string | null;
          has_prescription: boolean | null;
          reason: string | null;
          veterinarian: string | null;
          clinic: string | null;
          general_instructions: string | null;
          prescription_date: string | null;
          next_checkup_date: string | null;
          medications: Json | null;
        };
        Relationships: [];
      };
    };
    Enums: {
      calendar_event_type:
        | "vacuna"
        | "desparasitacion"
        | "consulta"
        | "cirugia"
        | "control"
        | "examen_lab"
        | "examen_imagen"
        | "fin_tratamiento"
        | "otro";
      clinical_event_type: "consulta" | "examen" | "cirugia" | "otro";
      deworming_type: "interna" | "externa" | "mixta";
      exam_category:
        | "hemograma"
        | "perfil_bioquimico"
        | "orina"
        | "copro"
        | "hormonas"
        | "otro";
      imaging_type: "rx" | "eco" | "tac" | "rm" | "otro";
      notification_type:
        | "vacuna_recordatorio"
        | "vacuna_vencida"
        | "desparasitacion"
        | "fin_tratamiento"
        | "proximo_control"
        | "manual";
      panel_role:
        | "super_admin"
        | "admin"
        | "clinic_manager"
        | "veterinarian"
        | "support"
        | "viewer";
      sex_type: "macho" | "hembra";
      species_type: "perro" | "gato" | "conejo" | "ave" | "reptil" | "otro";
      subscription_status:
        "active" | "cancelled" | "past_due" | "trialing" | "inactive";
      subscription_payment_method: "apple" | "google" | "card";
      vaccine_application_type: "refuerzo" | "anual";
    };
    CompositeTypes: Record<string, never>;
  };
}

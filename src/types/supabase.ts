export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      trip_parks: {
        Row: {
          id: string
          trip_id: string
          park_code: string
          notes: string | null
          added_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          park_code: string
          notes?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          park_code?: string
          notes?: string | null
          added_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          dark_mode: boolean
          default_view: string
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          dark_mode?: boolean
          default_view?: string
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          dark_mode?: boolean
          default_view?: string
          created_at?: string
        }
        Relationships: []
      }
      park_saves: {
        Row: {
          id: string
          user_id: string
          park_code: string
          wishlisted: boolean
          visited: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          park_code: string
          wishlisted?: boolean
          visited?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          park_code?: string
          wishlisted?: boolean
          visited?: boolean
          created_at?: string
        }
        Relationships: []
      }
      parks: {
        Row: {
          park_code: string
          full_name: string
          description: string | null
          states: string
          designation: string | null
          latitude: string | null
          longitude: string | null
          image_url: string | null
          image_alt: string | null
          url: string | null
          updated_at: string
        }
        Insert: {
          park_code: string
          full_name: string
          description?: string | null
          states: string
          designation?: string | null
          latitude?: string | null
          longitude?: string | null
          image_url?: string | null
          image_alt?: string | null
          url?: string | null
          updated_at?: string
        }
        Update: {
          park_code?: string
          full_name?: string
          description?: string | null
          states?: string
          designation?: string | null
          latitude?: string | null
          longitude?: string | null
          image_url?: string | null
          image_alt?: string | null
          url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Trip = Database['public']['Tables']['trips']['Row']
export type TripPark = Database['public']['Tables']['trip_parks']['Row']
export type ParkRow = Database['public']['Tables']['parks']['Row']
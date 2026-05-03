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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type Profiles = Tables<'profiles'>
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripPark = Database['public']['Tables']['trip_parks']['Row']
export type ParkSaves = Tables<'park_saves'>

export type InsertProfiles = Database['public']['Tables']['profiles']['Insert']
export type UpdateProfiles = Database['public']['Tables']['profiles']['Update']
export type InsertParkSaves = Database['public']['Tables']['park_saves']['Insert']
export type UpdateParkSaves = Database['public']['Tables']['park_saves']['Update']
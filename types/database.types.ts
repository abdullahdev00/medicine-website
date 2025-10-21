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
      admin_users: {
        Row: {
          user_id: string
          role: string
          permissions: Json
          is_active: boolean
          department: string
          access_level: string
          created_at: string
          last_login_at: string | null
        }
        Insert: {
          user_id: string
          role?: string
          permissions?: Json
          is_active?: boolean
          department?: string
          access_level?: string
          created_at?: string
          last_login_at?: string | null
        }
        Update: {
          user_id?: string
          role?: string
          permissions?: Json
          is_active?: boolean
          department?: string
          access_level?: string
          created_at?: string
          last_login_at?: string | null
        }
      }
      admin_whitelist: {
        Row: {
          id: string
          email: string
          invited_by: string | null
          invite_code: string | null
          used: boolean
          used_at: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          email: string
          invited_by?: string | null
          invite_code?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string | null
          invite_code?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          phone_number: string | null
          whatsapp_number: string | null
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_number?: string | null
          whatsapp_number?: string | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string | null
          whatsapp_number?: string | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          password: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          password: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          password?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total_price: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total_price?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_price?: string
          created_at?: string
          updated_at?: string
        }
      }
      payment_requests: {
        Row: {
          id: string
          user_id: string
          status: string
          amount: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          amount?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          amount?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_password: {
        Args: {
          password: string
          encrypted_password: string
        }
        Returns: boolean
      }
      admin_login_check_simple: {
        Args: {
          p_email: string
          p_password: string
        }
        Returns: {
          user_id: string
          email: string
          role: string
          permissions: Json
          department: string
          access_level: string
          full_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

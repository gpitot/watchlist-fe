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
      books: {
        Row: {
          created_at: string | null
          goodreads_url: string | null
          id: number
          image: string | null
          isbn: string | null
          isbn13: string | null
          library_url: string | null
          status: string | null
          title: string | null
          userid: number
        }
        Insert: {
          created_at?: string | null
          goodreads_url?: string | null
          id?: number
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          library_url?: string | null
          status?: string | null
          title?: string | null
          userid: number
        }
        Update: {
          created_at?: string | null
          goodreads_url?: string | null
          id?: number
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          library_url?: string | null
          status?: string | null
          title?: string | null
          userid?: number
        }
        Relationships: [
          {
            foreignKeyName: "books_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      movie_credits: {
        Row: {
          created_at: string
          id: number
          movie_id: number
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: number
          movie_id: number
          name: string
          role: string
        }
        Update: {
          created_at?: string
          id?: number
          movie_id?: number
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          }
        ]
      }
      movie_providers: {
        Row: {
          created_at: string
          id: number
          movie_id: number
          provider_name: string
          provider_type: string
        }
        Insert: {
          created_at?: string
          id?: number
          movie_id: number
          provider_name: string
          provider_type: string
        }
        Update: {
          created_at?: string
          id?: number
          movie_id?: number
          provider_name?: string
          provider_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_providers_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          }
        ]
      }
      movies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          movie_db_id: number
          production: string | null
          release_date: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          movie_db_id: number
          production?: string | null
          release_date?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          movie_db_id?: number
          production?: string | null
          release_date?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      movies_genres: {
        Row: {
          created_at: string
          genre: string | null
          id: number
          movie_id: number
        }
        Insert: {
          created_at?: string
          genre?: string | null
          id?: number
          movie_id: number
        }
        Update: {
          created_at?: string
          genre?: string | null
          id?: number
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "movies_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          }
        ]
      }
      movies_users: {
        Row: {
          created_at: string
          movie_id: number
          notes: string | null
          rating: number | null
          user_id: string
          watched: boolean
        }
        Insert: {
          created_at?: string
          movie_id: number
          notes?: string | null
          rating?: number | null
          user_id: string
          watched: boolean
        }
        Update: {
          created_at?: string
          movie_id?: number
          notes?: string | null
          rating?: number | null
          user_id?: string
          watched?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "movies_users_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movies_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string | null
          goodreads_id: string
          id: number
          shelf: string
          username: string
        }
        Insert: {
          created_at?: string | null
          goodreads_id: string
          id?: number
          shelf: string
          username: string
        }
        Update: {
          created_at?: string | null
          goodreads_id?: string
          id?: number
          shelf?: string
          username?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

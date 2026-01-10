export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      book_availability: {
        Row: {
          created_at: string
          id: string
          location_id: string
          next_available_timestamp: string | null
          status: string
          synced_timestamp: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          next_available_timestamp?: string | null
          status: string
          synced_timestamp: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          next_available_timestamp?: string | null
          status?: string
          synced_timestamp?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      book_metadata: {
        Row: {
          author: string
          created_at: string
          id: string
          image: string | null
          isbn: string | null
          isbn13: string | null
          title: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          title: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          title?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          borrow_box_next_available_epoch: number | null
          borrow_box_preview_url: string | null
          borrow_box_status: string | null
          borrow_box_url: string | null
          created_at: string | null
          description: string | null
          goodreads_url: string | null
          google_search_status: boolean
          id: number
          image: string | null
          isbn: string | null
          isbn13: string | null
          library_status: Json | null
          library_url: string | null
          status: string | null
          title: string | null
          userid: number
        }
        Insert: {
          borrow_box_next_available_epoch?: number | null
          borrow_box_preview_url?: string | null
          borrow_box_status?: string | null
          borrow_box_url?: string | null
          created_at?: string | null
          description?: string | null
          goodreads_url?: string | null
          google_search_status?: boolean
          id?: number
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          library_status?: Json | null
          library_url?: string | null
          status?: string | null
          title?: string | null
          userid: number
        }
        Update: {
          borrow_box_next_available_epoch?: number | null
          borrow_box_preview_url?: string | null
          borrow_box_status?: string | null
          borrow_box_url?: string | null
          created_at?: string | null
          description?: string | null
          goodreads_url?: string | null
          google_search_status?: boolean
          id?: number
          image?: string | null
          isbn?: string | null
          isbn13?: string | null
          library_status?: Json | null
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
          },
        ]
      }
      location: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
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
          },
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
          },
        ]
      }
      movie_videos: {
        Row: {
          created_at: string
          id: string
          movie_id: number
          published_at: string
          url: string
          video_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: number
          published_at: string
          url: string
          video_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: number
          published_at?: string
          url?: string
          video_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          medium: string
          movie_db_id: number
          production: string | null
          providers_refreshed_date: string
          release_date: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          medium: string
          movie_db_id: number
          production?: string | null
          providers_refreshed_date: string
          release_date?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          medium?: string
          movie_db_id?: number
          production?: string | null
          providers_refreshed_date?: string
          release_date?: string | null
          title?: string
        }
        Relationships: []
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
          },
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
            referencedRelation: "available_streams"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_streams"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_book: {
        Row: {
          book_metadata_id: string
          created_at: string
          id: string
          rating: number | null
          status: string
          synced_timestamp: string
          user_id: string
        }
        Insert: {
          book_metadata_id: string
          created_at?: string
          id?: string
          rating?: number | null
          status: string
          synced_timestamp: string
          user_id: string
        }
        Update: {
          book_metadata_id?: string
          created_at?: string
          id?: string
          rating?: number | null
          status?: string
          synced_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_book_book_metadata_id_fkey"
            columns: ["book_metadata_id"]
            isOneToOne: false
            referencedRelation: "book_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_book_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_book_source: {
        Row: {
          created_at: string
          id: string
          name: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_book_source_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memories: {
        Row: {
          answer: string
          created_at: string
          id: number
          memory: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: number
          memory?: string | null
          user_id?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: number
          memory?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_streams"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_providers: {
        Row: {
          created_at: string
          id: string
          provider_name: string
        }
        Insert: {
          created_at?: string
          id: string
          provider_name: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_providers_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "available_streams"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          keys: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          keys?: Json | null
          user_id?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          keys?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "available_streams"
            referencedColumns: ["user_id"]
          },
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
      available_streams: {
        Row: {
          created_at: string | null
          email: string | null
          provider_name: string | null
          provider_type: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string
          media_type: string
          show_after_seconds: number
          show_once_per_session: boolean
          start_date: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url: string
          media_type?: string
          show_after_seconds?: number
          show_once_per_session?: boolean
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string
          media_type?: string
          show_after_seconds?: number
          show_once_per_session?: boolean
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_media: {
        Row: {
          blog_post_id: string
          created_at: string
          display_order: number | null
          file_size: number | null
          id: string
          is_featured: boolean | null
          media_description: string | null
          media_title: string | null
          media_type: string
          media_url: string
          mime_type: string | null
          updated_at: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_description?: string | null
          media_title?: string | null
          media_type: string
          media_url: string
          mime_type?: string | null
          updated_at?: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_description?: string | null
          media_title?: string | null
          media_type?: string
          media_url?: string
          mime_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_media_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          comment_count: number | null
          content: string | null
          content_type: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          like_count: number | null
          media_layout: string | null
          media_urls: string[] | null
          meta_description: string | null
          more_info_links: Json | null
          og_image: string | null
          published_at: string | null
          reading_time: number | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          comment_count?: number | null
          content?: string | null
          content_type?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          media_layout?: string | null
          media_urls?: string[] | null
          meta_description?: string | null
          more_info_links?: Json | null
          og_image?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          comment_count?: number | null
          content?: string | null
          content_type?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          media_layout?: string | null
          media_urls?: string[] | null
          meta_description?: string | null
          more_info_links?: Json | null
          og_image?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          num_travelers: number | null
          package_id: string | null
          status: string
          total_amount: number | null
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          num_travelers?: number | null
          package_id?: string | null
          status?: string
          total_amount?: number | null
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          num_travelers?: number | null
          package_id?: string | null
          status?: string
          total_amount?: number | null
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          post_id: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          post_id?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          expense_date: string | null
          id: string
          recorded_by: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          recorded_by?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          media_type: string | null
          media_url: string
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string | null
          media_url: string
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string | null
          media_url?: string
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          income_date: string | null
          recorded_by: string | null
          source: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          income_date?: string | null
          recorded_by?: string | null
          source?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          income_date?: string | null
          recorded_by?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incomes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      information_center: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          language: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          language?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          language?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      information_center_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          information_center_id: string
          is_primary: boolean | null
          media_type: string
          media_url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          information_center_id: string
          is_primary?: boolean | null
          media_type: string
          media_url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          information_center_id?: string
          is_primary?: boolean | null
          media_type?: string
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_information_center"
            columns: ["information_center_id"]
            isOneToOne: false
            referencedRelation: "information_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "information_center_media_information_center_id_fkey"
            columns: ["information_center_id"]
            isOneToOne: false
            referencedRelation: "information_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      information_centers: {
        Row: {
          address: string
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          opening_hours: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          opening_hours?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      internships: {
        Row: {
          applicant_id: string | null
          cover_letter: string | null
          created_at: string
          cv_url: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          reviewed_by: string | null
          status: string | null
          type: string
          university: string | null
          updated_at: string
        }
        Insert: {
          applicant_id?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          reviewed_by?: string | null
          status?: string | null
          type: string
          university?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          reviewed_by?: string | null
          status?: string | null
          type?: string
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      package_itineraries: {
        Row: {
          created_at: string
          day_number: number
          description: string | null
          display_order: number
          id: string
          location: string | null
          package_id: string
          title: string
        }
        Insert: {
          created_at?: string
          day_number?: number
          description?: string | null
          display_order?: number
          id?: string
          location?: string | null
          package_id: string
          title: string
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string | null
          display_order?: number
          id?: string
          location?: string | null
          package_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_itineraries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          availability: boolean | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount: number | null
          duration: string | null
          features: string[] | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          availability?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: number | null
          duration?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          availability?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: number | null
          duration?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          payment_method: string | null
          status: string
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          package_id: string | null
          rating: number | null
          reviewer_id: string | null
          reviewer_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          package_id?: string | null
          rating?: number | null
          reviewer_id?: string | null
          reviewer_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          package_id?: string | null
          rating?: number | null
          reviewer_id?: string | null
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          paid_date: string
          period_end: string | null
          period_start: string | null
          recorded_by: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date: string
          period_end?: string | null
          period_start?: string | null
          recorded_by?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string
          period_end?: string | null
          period_start?: string | null
          recorded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_packages: {
        Row: {
          created_at: string
          id: string
          package_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          package_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          data_type: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          category?: string
          data_type?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          data_type?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_avatar: string | null
          client_id: string | null
          client_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          package_id: string | null
          rating: number | null
        }
        Insert: {
          client_avatar?: string | null
          client_id?: string | null
          client_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          package_id?: string | null
          rating?: number | null
        }
        Update: {
          client_avatar?: string | null
          client_id?: string | null
          client_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          package_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          language: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          language: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          language?: string
          value?: string
        }
        Relationships: []
      }
      umurage_kids_applications: {
        Row: {
          admin_notes: string | null
          child_age: number | null
          child_name: string
          created_at: string
          id: string
          message: string | null
          parent_email: string
          parent_name: string
          parent_phone: string | null
          program_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          child_age?: number | null
          child_name: string
          created_at?: string
          id?: string
          message?: string | null
          parent_email: string
          parent_name: string
          parent_phone?: string | null
          program_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          child_age?: number | null
          child_name?: string
          created_at?: string
          id?: string
          message?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone?: string | null
          program_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "umurage_kids_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "umurage_kids_center"
            referencedColumns: ["id"]
          },
        ]
      }
      umurage_kids_center: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_salary_config: {
        Row: {
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          notes: string | null
          salary_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string | null
          salary_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          notes?: string | null
          salary_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          activity_id: string | null
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "volunteerism_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteerism_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_published: boolean
          location: string | null
          max_volunteers: number | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          max_volunteers?: number | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          max_volunteers?: number | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_highest_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role_simple: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tour_manager" | "accountant" | "client"
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
    Enums: {
      app_role: ["admin", "tour_manager", "accountant", "client"],
    },
  },
} as const

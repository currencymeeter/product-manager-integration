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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      business_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      demos: {
        Row: {
          access_type: string
          category: string
          conversions: number
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          total_views: number
          updated_at: string
          url: string
        }
        Insert: {
          access_type?: string
          category?: string
          conversions?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          total_views?: number
          updated_at?: string
          url: string
        }
        Update: {
          access_type?: string
          category?: string
          conversions?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          total_views?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      pm_abuse_alerts: {
        Row: {
          created_at: string
          detected_at: string
          id: string
          ip_address: string
          product_name: string
          reference: string
          resolved: boolean
          severity: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          id?: string
          ip_address: string
          product_name: string
          reference: string
          resolved?: boolean
          severity?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          id?: string
          ip_address?: string
          product_name?: string
          reference?: string
          resolved?: boolean
          severity?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_api_keys: {
        Row: {
          created_at: string
          id: string
          key_preview: string
          last_used_at: string | null
          name: string
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_preview: string
          last_used_at?: string | null
          name: string
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_approvals: {
        Row: {
          created_at: string
          decided_at: string | null
          decision_note: string | null
          details: string | null
          id: string
          priority: string
          reference: string
          requested_at: string
          requested_by: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          details?: string | null
          id?: string
          priority?: string
          reference: string
          requested_at?: string
          requested_by: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          details?: string | null
          id?: string
          priority?: string
          reference?: string
          requested_at?: string
          requested_by?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_build_versions: {
        Row: {
          author: string
          changes: string
          created_at: string
          id: string
          reference: string
          released_on: string
          version: string
        }
        Insert: {
          author?: string
          changes: string
          created_at?: string
          id?: string
          reference: string
          released_on?: string
          version: string
        }
        Update: {
          author?: string
          changes?: string
          created_at?: string
          id?: string
          reference?: string
          released_on?: string
          version?: string
        }
        Relationships: []
      }
      pm_builds: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          locked: boolean
          name: string
          reference: string
          size: string | null
          status: string
          type: string
          updated_at: string
          uploaded_at: string
          version: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          locked?: boolean
          name: string
          reference: string
          size?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          locked?: boolean
          name?: string
          reference?: string
          size?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_at?: string
          version?: string
        }
        Relationships: []
      }
      pm_country_access: {
        Row: {
          country_code: string
          created_at: string
          enabled: boolean
          franchises: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          enabled?: boolean
          franchises?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          enabled?: boolean
          franchises?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_country_sales: {
        Row: {
          country: string
          created_at: string
          id: string
          period_month: string
          sales: number
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          period_month?: string
          sales?: number
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          period_month?: string
          sales?: number
        }
        Relationships: []
      }
      pm_demo_funnel: {
        Row: {
          count: number
          created_at: string
          display_order: number
          id: string
          period_month: string
          stage: string
        }
        Insert: {
          count?: number
          created_at?: string
          display_order?: number
          id?: string
          period_month?: string
          stage: string
        }
        Update: {
          count?: number
          created_at?: string
          display_order?: number
          id?: string
          period_month?: string
          stage?: string
        }
        Relationships: []
      }
      pm_deployment_logs: {
        Row: {
          created_at: string
          deployment_reference: string | null
          id: string
          level: string
          message: string
        }
        Insert: {
          created_at?: string
          deployment_reference?: string | null
          id?: string
          level?: string
          message: string
        }
        Update: {
          created_at?: string
          deployment_reference?: string | null
          id?: string
          level?: string
          message?: string
        }
        Relationships: []
      }
      pm_deployments: {
        Row: {
          created_at: string
          deployed_at: string
          environment: string
          id: string
          product_name: string
          reference: string
          server_code: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          deployed_at?: string
          environment?: string
          id?: string
          product_name: string
          reference: string
          server_code?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          deployed_at?: string
          environment?: string
          id?: string
          product_name?: string
          reference?: string
          server_code?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      pm_modules: {
        Row: {
          created_at: string
          id: string
          locked: boolean
          name: string
          reference: string
          role_restricted: boolean
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locked?: boolean
          name: string
          reference: string
          role_restricted?: boolean
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locked?: boolean
          name?: string
          reference?: string
          role_restricted?: boolean
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_product_performance: {
        Row: {
          change_percent: number
          created_at: string
          id: string
          period_month: string
          product_name: string
          sales: number
        }
        Insert: {
          change_percent?: number
          created_at?: string
          id?: string
          period_month?: string
          product_name: string
          sales?: number
        }
        Update: {
          change_percent?: number
          created_at?: string
          id?: string
          period_month?: string
          product_name?: string
          sales?: number
        }
        Relationships: []
      }
      pm_roles: {
        Row: {
          code: string
          created_at: string
          id: string
          level: number
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          level?: number
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          level?: number
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pm_servers: {
        Row: {
          code: string
          created_at: string
          id: string
          load: number
          name: string
          region: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          load?: number
          name: string
          region: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          load?: number
          name?: string
          region?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pm_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      pm_software_profiles: {
        Row: {
          active_users: number
          created_at: string
          deployed_to: number
          description: string | null
          id: string
          modules: string[]
          name: string
          ownership: string
          reference: string
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          active_users?: number
          created_at?: string
          deployed_to?: number
          description?: string | null
          id?: string
          modules?: string[]
          name: string
          ownership?: string
          reference: string
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          active_users?: number
          created_at?: string
          deployed_to?: number
          description?: string | null
          id?: string
          modules?: string[]
          name?: string
          ownership?: string
          reference?: string
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      product_action_logs: {
        Row: {
          action: string
          action_details: Json | null
          created_at: string
          id: string
          performed_by: string | null
          product_id: string | null
          product_name: string
        }
        Insert: {
          action: string
          action_details?: Json | null
          created_at?: string
          id?: string
          performed_by?: string | null
          product_id?: string | null
          product_name?: string
        }
        Update: {
          action?: string
          action_details?: Json | null
          created_at?: string
          id?: string
          performed_by?: string | null
          product_id?: string | null
          product_name?: string
        }
        Relationships: []
      }
      product_demo_mappings: {
        Row: {
          created_at: string
          demo_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          demo_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          demo_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_demo_mappings_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_demo_mappings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          auto_restock: boolean
          available_stock: number
          created_at: string
          forecast_note: string | null
          id: string
          low_threshold: number
          product_id: string | null
          reserved: number
          stock_type: string
          total_stock: number
          updated_at: string
        }
        Insert: {
          auto_restock?: boolean
          available_stock?: number
          created_at?: string
          forecast_note?: string | null
          id?: string
          low_threshold?: number
          product_id?: string | null
          reserved?: number
          stock_type?: string
          total_stock?: number
          updated_at?: string
        }
        Update: {
          auto_restock?: boolean
          available_stock?: number
          created_at?: string
          forecast_note?: string | null
          id?: string
          low_threshold?: number
          product_id?: string | null
          reserved?: number
          stock_type?: string
          total_stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_licenses: {
        Row: {
          created_at: string
          domain_bound: string | null
          expires_at: string | null
          id: string
          license_key: string
          locked: boolean
          product_id: string | null
          product_name: string
          status: string
          updated_at: string
          user_email: string | null
        }
        Insert: {
          created_at?: string
          domain_bound?: string | null
          expires_at?: string | null
          id?: string
          license_key: string
          locked?: boolean
          product_id?: string | null
          product_name: string
          status?: string
          updated_at?: string
          user_email?: string | null
        }
        Update: {
          created_at?: string
          domain_bound?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string
          locked?: boolean
          product_id?: string | null
          product_name?: string
          status?: string
          updated_at?: string
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_micro_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          subcategory_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          subcategory_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          subcategory_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_micro_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "business_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_nano_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          micro_category_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          micro_category_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          micro_category_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_nano_categories_micro_category_id_fkey"
            columns: ["micro_category_id"]
            isOneToOne: false
            referencedRelation: "product_micro_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          id: string
          license_key: string | null
          order_number: string
          payment_status: string
          product_id: string | null
          product_name: string
          quantity: number
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          id?: string
          license_key?: string | null
          order_number: string
          payment_status?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          id?: string
          license_key?: string | null
          order_number?: string
          payment_status?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_pricing_plans: {
        Row: {
          billing_cycle: string | null
          country: string | null
          created_at: string
          currency: string
          features: string[]
          id: string
          is_active: boolean
          model: string
          name: string
          price: number
          product_id: string | null
          tier_level: number | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          features?: string[]
          id?: string
          is_active?: boolean
          model?: string
          name: string
          price?: number
          product_id?: string | null
          tier_level?: number | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          features?: string[]
          id?: string
          is_active?: boolean
          model?: string
          name?: string
          price?: number
          product_id?: string | null
          tier_level?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          blog_url: string | null
          business_category_id: string | null
          canonical_url: string | null
          changelog: string | null
          compatibility: string[]
          coupon_code: string | null
          created_at: string
          created_by: string | null
          currency: string
          demo_credentials: Json
          demo_embed: string | null
          demo_type: string | null
          demo_url: string | null
          demo_video_url: string | null
          description: string
          difficulty_level: string
          discount_price: number | null
          documentation_url: string | null
          feature_list: string[]
          featured_rank: number
          features_json: Json
          gallery_urls: string[]
          industry_tags: string[]
          installation_guide: string | null
          is_featured: boolean
          is_free: boolean
          is_subscription: boolean
          keywords: string[]
          last_updated_at: string
          license_tier: string
          license_type: string
          lifetime_price: number
          main_file_url: string | null
          manual_rank: number
          meta_description: string | null
          meta_title: string | null
          monthly_price: number
          og_description: string | null
          og_image: string | null
          og_title: string | null
          preview_urls: string[]
          pricing_model: string
          product_code: string
          product_id: string
          product_name: string
          product_type: string
          release_notes: string | null
          requirements: string | null
          search_keywords: string[]
          short_description: string | null
          slug: string | null
          status: string
          subcategory_id: string | null
          support_response_time: string | null
          support_url: string | null
          synonyms: string[]
          tags: string[]
          tech_stack_tags: string[]
          thumbnail_url: string | null
          trending: boolean
          updated_at: string
          use_case_tags: string[]
          verified_author: boolean
          version: string
          video_thumbnail_url: string | null
        }
        Insert: {
          blog_url?: string | null
          business_category_id?: string | null
          canonical_url?: string | null
          changelog?: string | null
          compatibility?: string[]
          coupon_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demo_credentials?: Json
          demo_embed?: string | null
          demo_type?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          description?: string
          difficulty_level?: string
          discount_price?: number | null
          documentation_url?: string | null
          feature_list?: string[]
          featured_rank?: number
          features_json?: Json
          gallery_urls?: string[]
          industry_tags?: string[]
          installation_guide?: string | null
          is_featured?: boolean
          is_free?: boolean
          is_subscription?: boolean
          keywords?: string[]
          last_updated_at?: string
          license_tier?: string
          license_type?: string
          lifetime_price?: number
          main_file_url?: string | null
          manual_rank?: number
          meta_description?: string | null
          meta_title?: string | null
          monthly_price?: number
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          preview_urls?: string[]
          pricing_model?: string
          product_code?: string
          product_id?: string
          product_name: string
          product_type?: string
          release_notes?: string | null
          requirements?: string | null
          search_keywords?: string[]
          short_description?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          support_response_time?: string | null
          support_url?: string | null
          synonyms?: string[]
          tags?: string[]
          tech_stack_tags?: string[]
          thumbnail_url?: string | null
          trending?: boolean
          updated_at?: string
          use_case_tags?: string[]
          verified_author?: boolean
          version?: string
          video_thumbnail_url?: string | null
        }
        Update: {
          blog_url?: string | null
          business_category_id?: string | null
          canonical_url?: string | null
          changelog?: string | null
          compatibility?: string[]
          coupon_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demo_credentials?: Json
          demo_embed?: string | null
          demo_type?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          description?: string
          difficulty_level?: string
          discount_price?: number | null
          documentation_url?: string | null
          feature_list?: string[]
          featured_rank?: number
          features_json?: Json
          gallery_urls?: string[]
          industry_tags?: string[]
          installation_guide?: string | null
          is_featured?: boolean
          is_free?: boolean
          is_subscription?: boolean
          keywords?: string[]
          last_updated_at?: string
          license_tier?: string
          license_type?: string
          lifetime_price?: number
          main_file_url?: string | null
          manual_rank?: number
          meta_description?: string | null
          meta_title?: string | null
          monthly_price?: number
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          preview_urls?: string[]
          pricing_model?: string
          product_code?: string
          product_id?: string
          product_name?: string
          product_type?: string
          release_notes?: string | null
          requirements?: string | null
          search_keywords?: string[]
          short_description?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          support_response_time?: string | null
          support_url?: string | null
          synonyms?: string[]
          tags?: string[]
          tech_stack_tags?: string[]
          thumbnail_url?: string | null
          trending?: boolean
          updated_at?: string
          use_case_tags?: string[]
          verified_author?: boolean
          version?: string
          video_thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "business_subcategories"
            referencedColumns: ["id"]
          },
        ]
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'dev' | 'member' | 'admin'
export type ProjectCategory = 'course' | 'consulting' | 'ai_agent' | 'internal'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EmailDirection = 'inbound' | 'outbound'
export type EmailStatus = 'received' | 'read' | 'draft' | 'sent' | 'archived'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Relationships: []
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          is_agent?: boolean
          agent_model?: string | null
          agent_system_prompt?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          is_agent?: boolean
          agent_model?: string | null
          agent_system_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          is_agent?: boolean
          agent_model?: string | null
          agent_system_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Relationships: [
          {
            foreignKeyName: 'projects_created_by_fkey',
            columns: ['created_by'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          title: string
          description: string | null
          category: ProjectCategory
          status: ProjectStatus
          client_name: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: ProjectCategory
          status?: ProjectStatus
          client_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: ProjectCategory
          status?: ProjectStatus
          client_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey',
            columns: ['project_id'],
            isOneToOne: false,
            referencedRelation: 'projects',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'tasks_assigned_to_fkey',
            columns: ['assigned_to'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'tasks_created_by_fkey',
            columns: ['created_by'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          assigned_to: string | null
          due_date: string | null
          position: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          due_date?: string | null
          position?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          due_date?: string | null
          position?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey',
            columns: ['sender_id'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          channel: string
          sender_id: string
          content: string
          attachments: Json | null
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel?: string
          sender_id: string
          content: string
          attachments?: Json | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel?: string
          sender_id?: string
          content?: string
          attachments?: Json | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Relationships: [
          {
            foreignKeyName: 'emails_created_by_fkey',
            columns: ['created_by'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          direction: EmailDirection
          from_address: string
          to_address: string[]
          cc_address: string[] | null
          bcc_address: string[] | null
          subject: string
          body_html: string | null
          body_text: string | null
          status: EmailStatus
          thread_id: string | null
          message_id: string | null
          resend_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          direction: EmailDirection
          from_address: string
          to_address: string[]
          cc_address?: string[] | null
          bcc_address?: string[] | null
          subject: string
          body_html?: string | null
          body_text?: string | null
          status?: EmailStatus
          thread_id?: string | null
          message_id?: string | null
          resend_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          direction?: EmailDirection
          from_address?: string
          to_address?: string[]
          cc_address?: string[] | null
          bcc_address?: string[] | null
          subject?: string
          body_html?: string | null
          body_text?: string | null
          status?: EmailStatus
          thread_id?: string | null
          message_id?: string | null
          resend_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Relationships: [
          {
            foreignKeyName: 'files_project_id_fkey',
            columns: ['project_id'],
            isOneToOne: false,
            referencedRelation: 'projects',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'files_uploaded_by_fkey',
            columns: ['uploaded_by'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          name: string
          storage_path: string
          size_bytes: number
          mime_type: string
          project_id: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          storage_path: string
          size_bytes: number
          mime_type: string
          project_id?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          storage_path?: string
          size_bytes?: number
          mime_type?: string
          project_id?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      student_codes: {
        Relationships: []
        Row: {
          id: string
          code: string
          student_name: string
          student_email: string
          course_title: string
          access_tier: string
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          student_name: string
          student_email: string
          course_title?: string
          access_tier?: string
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          student_name?: string
          student_email?: string
          course_title?: string
          access_tier?: string
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_registrations: {
        Relationships: []
        Row: {
          id: string
          name: string
          email: string
          ai_experience: string | null
          objective: string | null
          blocker: string | null
          expectation: string | null
          raw_answers: Json | null
          status: 'pending' | 'approved' | 'rejected'
          access_code: string | null
          approved: boolean
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          ai_experience?: string | null
          objective?: string | null
          blocker?: string | null
          expectation?: string | null
          raw_answers?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          access_code?: string | null
          approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          ai_experience?: string | null
          objective?: string | null
          blocker?: string | null
          expectation?: string | null
          raw_answers?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          access_code?: string | null
          approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_agent_runs: {
        Relationships: [
          {
            foreignKeyName: 'task_agent_runs_task_id_fkey',
            columns: ['task_id'],
            isOneToOne: false,
            referencedRelation: 'tasks',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'task_agent_runs_agent_id_fkey',
            columns: ['agent_id'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          task_id: string
          agent_id: string
          prompt_sent: string
          output_response: string | null
          tokens_used: number
          status: 'running' | 'success' | 'failed' | 'approved' | 'rejected'
          user_feedback: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          agent_id: string
          prompt_sent: string
          output_response?: string | null
          tokens_used?: number
          status?: 'running' | 'success' | 'failed' | 'approved' | 'rejected'
          user_feedback?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          agent_id?: string
          prompt_sent?: string | null
          output_response?: string | null
          tokens_used?: number
          status?: 'running' | 'success' | 'failed' | 'approved' | 'rejected'
          user_feedback?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      knowledge_items: {
        Relationships: []
        Row: {
          id: string
          title: string
          category: string
          tags: string[]
          description: string | null
          content: string
          lesson_id: number | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category?: string
          tags?: string[]
          description?: string | null
          content?: string
          lesson_id?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          tags?: string[]
          description?: string | null
          content?: string
          lesson_id?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      marketing_campaigns: {
        Relationships: []
        Row: {
          id: string
          user_id: string | null
          title: string
          product_name: string
          price: number
          target_avatar: string | null
          awareness_level: string
          core_desire: string | null
          core_pain: string | null
          big_idea: string | null
          unique_mechanism: string | null
          guarantee: string | null
          budget_daily: number
          platforms: Json
          kpi_cpa: number | null
          kpi_roas: number
          status: string
          funnel_blueprint: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          product_name: string
          price?: number
          target_avatar?: string | null
          awareness_level?: string
          core_desire?: string | null
          core_pain?: string | null
          big_idea?: string | null
          unique_mechanism?: string | null
          guarantee?: string | null
          budget_daily?: number
          platforms?: Json
          kpi_cpa?: number | null
          kpi_roas?: number
          status?: string
          funnel_blueprint?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          product_name?: string
          price?: number
          target_avatar?: string | null
          awareness_level?: string
          core_desire?: string | null
          core_pain?: string | null
          big_idea?: string | null
          unique_mechanism?: string | null
          guarantee?: string | null
          budget_daily?: number
          platforms?: Json
          kpi_cpa?: number | null
          kpi_roas?: number
          status?: string
          funnel_blueprint?: Json
          created_at?: string
          updated_at?: string
        }
      }
      marketing_posts: {
        Relationships: [
          {
            foreignKeyName: 'marketing_posts_campaign_id_fkey',
            columns: ['campaign_id'],
            isOneToOne: false,
            referencedRelation: 'marketing_campaigns',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          campaign_id: string | null
          day: string
          post_type: string
          title: string
          summary: string | null
          full_copy: string
          tag: string | null
          cta: string | null
          platform: string
          scheduled_at: string | null
          status: string
          n8n_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          day: string
          post_type: string
          title: string
          summary?: string | null
          full_copy: string
          tag?: string | null
          cta?: string | null
          platform?: string
          scheduled_at?: string | null
          status?: string
          n8n_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          day?: string
          post_type?: string
          title?: string
          summary?: string | null
          full_copy?: string
          tag?: string | null
          cta?: string | null
          platform?: string
          scheduled_at?: string | null
          status?: string
          n8n_response?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Relationships: [
          {
            foreignKeyName: 'calendar_events_created_by_fkey',
            columns: ['created_by'],
            isOneToOne: false,
            referencedRelation: 'profiles',
            referencedColumns: ['id'],
          },
        ]
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string
          category: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string
          category?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string
          category?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      waitlist_leads: {
        Relationships: []
        Row: {
          id: string
          email: string
          name: string | null
          course_interest: string
          converted_to_student: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          course_interest?: string
          converted_to_student?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          course_interest?: string
          converted_to_student?: boolean
          created_at?: string
        }
      }
      student_missions: {
        Relationships: []
        Row: {
          id: string
          user_id: string | null
          student_email: string
          student_name: string
          course_tier: 'ai-start' | 'ai-pro'
          mission_id: number
          mission_title: string
          status: 'todo' | 'in_progress' | 'completed'
          student_submission: string | null
          score: number | null
          mira_feedback: Json
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          student_email: string
          student_name?: string
          course_tier?: 'ai-start' | 'ai-pro'
          mission_id: number
          mission_title: string
          status?: 'todo' | 'in_progress' | 'completed'
          student_submission?: string | null
          score?: number | null
          mira_feedback?: Json
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          student_email?: string
          student_name?: string
          course_tier?: 'ai-start' | 'ai-pro'
          mission_id?: number
          mission_title?: string
          status?: 'todo' | 'in_progress' | 'completed'
          student_submission?: string | null
          score?: number | null
          mira_feedback?: Json
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_certificates: {
        Relationships: []
        Row: {
          id: string
          certificate_code: string
          student_email: string
          student_name: string
          course_tier: 'ai-start' | 'ai-pro'
          average_score: number
          issued_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          certificate_code: string
          student_email: string
          student_name: string
          course_tier?: 'ai-start' | 'ai-pro'
          average_score: number
          issued_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          certificate_code?: string
          student_email?: string
          student_name?: string
          course_tier?: 'ai-start' | 'ai-pro'
          average_score?: number
          issued_at?: string
          metadata?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_team_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_student_code: {
        Args: { input_code: string }
        Returns: Array<{
          id: string
          code: string
          student_name: string
          student_email: string
          course_title: string
          completed_lessons: number | null
          is_active: boolean
          access_tier: string
        }>
      }
    }
    Enums: {
      user_role: UserRole
      project_category: ProjectCategory
      project_status: ProjectStatus
      task_status: TaskStatus
      task_priority: TaskPriority
      email_direction: EmailDirection
      email_status: EmailStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

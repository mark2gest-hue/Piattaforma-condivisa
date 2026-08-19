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
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: UserRole
          is_active: boolean
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
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_team_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

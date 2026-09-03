import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Email = Database['public']['Tables']['emails']['Row']
export type FileItem = Database['public']['Tables']['files']['Row']
export type CourseRegistration = Database['public']['Tables']['course_registrations']['Row']
export type StudentCode = Database['public']['Tables']['student_codes']['Row']
export type TaskAgentRun = Database['public']['Tables']['task_agent_runs']['Row']

export interface TaskWithAssignee extends Task {
  assignee?: Profile | null
  project?: Project | null
  agent_runs?: TaskAgentRun[]
}

export interface MessageWithSender extends Message {
  sender?: Profile | null
}

export type NavItem = {
  title: string
  href: string
  icon: string
  badge?: number
  description: string
}

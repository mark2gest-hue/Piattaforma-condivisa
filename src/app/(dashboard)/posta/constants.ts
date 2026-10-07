export interface EmailSenderOption {
  id: string
  email: string
  label: string
  domain: string
}

export const AVAILABLE_FROM_EMAILS: EmailSenderOption[] = [
  { id: 'impresa-aiutiamoci', email: 'impresa@aiutiamoci.cloud', label: 'aiutiamoci Impresa <impresa@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'info-aiutiamoci', email: 'info@aiutiamoci.cloud', label: 'aiutiamoci <info@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'team-aiutiamoci', email: 'team@aiutiamoci.cloud', label: 'Team aiutiamoci <team@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'pagamenti-aiutiamoci', email: 'pagamenti@aiutiamoci.cloud', label: 'Pagamenti aiutiamoci <pagamenti@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'assistenza-aiutiamoci', email: 'assistenza@aiutiamoci.cloud', label: 'Assistenza aiutiamoci <assistenza@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'info-mark2', email: 'info@mark2.cloud', label: 'Mark2 <info@mark2.cloud>', domain: 'mark2.cloud' },
  { id: 'support-mark2', email: 'support@mark2.cloud', label: 'Support Mark2 <support@mark2.cloud>', domain: 'mark2.cloud' },
]

export interface ArubaMailboxConfig {
  email: string
  password?: string
  label?: string
}

export const DEFAULT_IMAP_ACCOUNTS: ArubaMailboxConfig[] = [
  { email: 'impresa@aiutiamoci.cloud', label: 'impresa@aiutiamoci.cloud', password: '' },
  { email: 'info@aiutiamoci.cloud', label: 'info@aiutiamoci.cloud', password: '' },
  { email: 'team@aiutiamoci.cloud', label: 'team@aiutiamoci.cloud', password: '' },
  { email: 'pagamenti@aiutiamoci.cloud', label: 'pagamenti@aiutiamoci.cloud', password: '' },
  { email: 'assistenza@aiutiamoci.cloud', label: 'assistenza@aiutiamoci.cloud', password: '' },
  { email: 'info@mark2.cloud', label: 'info@mark2.cloud', password: '' },
  { email: 'support@mark2.cloud', label: 'support@mark2.cloud', password: '' },
]

export interface EmailFolder {
  id: string
  name: string
  color: string
  icon?: string
}

export const DEFAULT_CUSTOM_FOLDERS: EmailFolder[] = [
  { id: 'clienti', name: 'Clienti', color: 'emerald', icon: 'UserCheck' },
  { id: 'corsi', name: 'Corsi & Webinar', color: 'blue', icon: 'GraduationCap' },
  { id: 'fatture', name: 'Fatture & Pagamenti', color: 'amber', icon: 'CreditCard' },
  { id: 'risolte', name: 'Assistenza Risolta', color: 'indigo', icon: 'CheckCircle' },
]

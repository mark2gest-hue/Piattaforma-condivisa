export interface EmailSenderOption {
  id: string
  email: string
  label: string
  domain: string
}

export const AVAILABLE_FROM_EMAILS: EmailSenderOption[] = [
  { id: 'info-aiutiamoci', email: 'info@aiutiamoci.cloud', label: 'Ti AIuto <info@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'assistenza-aiutiamoci', email: 'assistenza@aiutiamoci.cloud', label: 'Assistenza Ti AIuto <assistenza@aiutiamoci.cloud>', domain: 'aiutiamoci.cloud' },
  { id: 'info-mar2', email: 'info@mar2.cloud', label: 'Mar2 <info@mar2.cloud>', domain: 'mar2.cloud' },
  { id: 'support-mar2', email: 'support@mar2.cloud', label: 'Support Mar2 <support@mar2.cloud>', domain: 'mar2.cloud' },
]

export interface ArubaMailboxConfig {
  email: string
  password?: string
  label?: string
}

export const DEFAULT_IMAP_ACCOUNTS: ArubaMailboxConfig[] = [
  { email: 'info@aiutiamoci.cloud', label: 'info@aiutiamoci.cloud', password: '' },
  { email: 'assistenza@aiutiamoci.cloud', label: 'assistenza@aiutiamoci.cloud', password: '' },
  { email: 'info@mar2.cloud', label: 'info@mar2.cloud', password: '' },
  { email: 'support@mar2.cloud', label: 'support@mar2.cloud', password: '' },
]

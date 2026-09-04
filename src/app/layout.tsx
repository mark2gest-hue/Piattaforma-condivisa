import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StructuredData } from '@/components/seo/structured-data'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aiutiamoci.cloud'),
  title: 'AIutiamoci | Piattaforma Formazione AI & Lavoro Condiviso',
  description: 'Il portale formativo e collaborativo per professionisti e aziende. 20 Video Lezioni AI Start, assistenza tutor @AI, prompt operativi e automazioni per il tuo lavoro.',
  keywords: ['Intelligenza Artificiale', 'Corso AI Start', 'Formazione AI', 'Prompt Engineering', 'Automazioni AI', 'Ti AIuto', 'aiutiamoci.cloud'],
  authors: [{ name: 'Team AIutiamoci', url: 'https://aiutiamoci.cloud' }],
  openGraph: {
    title: 'AIutiamoci | Corso AI Start & Piattaforma Lavoro Condiviso',
    description: 'Impara a dominare l’Intelligenza Artificiale da zero con 20 lezioni pratiche, prompt testati e strumenti di automazione per il tuo lavoro.',
    url: 'https://aiutiamoci.cloud',
    siteName: 'AIutiamoci',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/images/ai_start_course_banner.jpg',
        width: 1200,
        height: 630,
        alt: 'AIutiamoci - Corso AI Start',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIutiamoci | Corso AI Start & Formazione Pratica',
    description: 'Il percorso formativo completo in 20 moduli per integrare l’IA nel tuo lavoro quotidiano.',
    images: ['/images/ai_start_course_banner.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <StructuredData />
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

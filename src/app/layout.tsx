import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aiutiamoci.cloud'),
  title: 'Ti AIuto | Piattaforma Lavoro Condivisa & Formazione AI',
  description: 'Il portale formativo e collaborativo per professionisti e aziende. 20 Video Lezioni AI Start, registrazione sessioni Zoom, assistenza tutor @AI e automazioni aziendali.',
  keywords: ['Intelligenza Artificiale', 'Corso AI Start', 'Formazione AI', 'Prompt Engineering', 'Automazioni AI', 'Ti AIuto', 'aiutiamoci.cloud'],
  authors: [{ name: 'Team Ti AIuto', url: 'https://aiutiamoci.cloud' }],
  openGraph: {
    title: 'Ti AIuto | Piattaforma Lavoro Condivisa & Corso AI Start',
    description: 'Impara a dominare l’Intelligenza Artificiale da zero con 20 lezioni pratiche, prompt testati e strumenti di automazione per il tuo lavoro.',
    url: 'https://aiutiamoci.cloud',
    siteName: 'Ti AIuto Platform',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ti AIuto | Corso AI Start & Piattaforma Condivisa',
    description: 'Il percorso formativo completo in 20 moduli per integrare l’IA nel tuo lavoro quotidiano.',
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
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

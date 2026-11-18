import type { Metadata } from 'next'

export const metadata: Metadata = {
  manifest: '/manifest-student.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AIutiamoci Academy',
  },
}

export default function CorsiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

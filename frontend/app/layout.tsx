import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'DNA Sequence Analyzer - Professional Bioinformatics',
  description: 'Advanced DNA sequence analysis platform for molecular biologists and researchers',
  icons: {
    icon: '🧬',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  )
}

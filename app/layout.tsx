import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stratum — Decision Intelligence',
  description: '5-agent multi-round debate simulation for high-stakes decisions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-navy text-white antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}

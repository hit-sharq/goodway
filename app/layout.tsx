'use client'

import { useSession, signOut, SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata = {
  title: 'goodway — Find the door. Find your people.',
  description: 'Discover the local businesses worth finding, with verified directions to the right door, floor, and entrance.',
  applicationName: 'goodway',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

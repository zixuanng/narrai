import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GameContextProvider } from '@/contexts/GameContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Narrai - AI Adventure Game',
  description: 'An AI-powered text-based adventure game where your choices truly matter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameContextProvider>
          {children}
        </GameContextProvider>
      </body>
    </html>
  )
}
'use client'

import { useGameState } from '@/hooks/useGameState'
import { StartScreen } from '@/components/StartScreen'
import { GameContainer } from '@/components/GameContainer'

export default function Home() {
  const { isGameActive } = useGameState()

  return (
    <main className="h-screen">
      {isGameActive ? <GameContainer /> : <StartScreen />}
    </main>
  )
}
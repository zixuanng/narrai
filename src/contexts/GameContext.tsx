'use client'

import React, { createContext, useState, useEffect } from 'react'
import { GameState, Character } from '@/types/game'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface GameContextValue {
  gameState: GameState | null
  isGameActive: boolean
  updateGameState: (updates: Partial<GameState>) => void
  resetGame: () => void
  loadGame: (savedState: GameState) => void
  setIsGameActive: (active: boolean) => void
}

export const GameContext = createContext<GameContextValue | undefined>(undefined)

function createInitialGameState(): GameState {
  return {
    sessionId: `${Date.now()}-${Math.random()}`,
    sessionSeed: Math.floor(Math.random() * 999999) + 1,
    storyHistory: [],
    currentStoryText: '',
    currentChoices: [],
    currentImageUrl: null,
    inventory: [],
    currentQuest: null,
    characters: [],
    createdAt: Date.now(),
    lastUpdatedAt: Date.now()
  }
}

export function GameContextProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useLocalStorage<GameState | null>('narrai-game-state', null)
  const [isGameActive, setIsGameActive] = useState(false)

  // Check if there's a saved game on mount
  useEffect(() => {
    if (gameState && gameState.currentStoryText) {
      setIsGameActive(true)
    }
  }, [])

  const updateGameState = (updates: Partial<GameState>) => {
    if (!gameState) return

    const updatedState = {
      ...gameState,
      ...updates,
      lastUpdatedAt: Date.now()
    }

    setGameState(updatedState)
  }

  const resetGame = () => {
    const newState = createInitialGameState()
    setGameState(newState)
    setIsGameActive(true)
    return newState
  }

  const loadGame = (savedState: GameState) => {
    setGameState(savedState)
    setIsGameActive(true)
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        isGameActive,
        updateGameState,
        resetGame,
        loadGame,
        setIsGameActive
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
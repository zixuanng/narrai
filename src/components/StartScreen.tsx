'use client'

import { useState, useEffect } from 'react'
import { useGameState } from '@/hooks/useGameState'

export function StartScreen() {
  const { gameState, resetGame, loadGame, setIsGameActive } = useGameState()
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    // Check if there's a valid saved game
    if (gameState && gameState.currentStoryText) {
      setHasSavedGame(true)
    }
  }, [gameState])

  const handleContinue = () => {
    if (gameState) {
      setIsGameActive(true)
    }
  }

  const handleNewGame = async () => {
    setIsStarting(true)
    try {
      // Create fresh game state
      const newState = resetGame()

      // Call API to generate initial story
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyHistory: [],
          playerChoice: 'START',
          gameState: {
            inventory: [],
            currentQuest: null,
            characters: []
          }
        })
      })

      if (!storyResponse.ok) {
        throw new Error('Failed to generate initial story')
      }

      const storyData = await storyResponse.json()

      // Call API to generate initial image
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: storyData.imagePrompt,
          sessionSeed: newState.sessionSeed,
          characters: []
        })
      })

      let imageUrl = null
      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        imageUrl = imageData.imageUrl
      }

      // Apply state updates
      const { stateUpdates } = storyData
      const updatedInventory = [...(stateUpdates.inventoryAdd || [])]
      const updatedQuest = stateUpdates.questUpdate || null
      const newCharacters = (stateUpdates.newCharacters || []).map((char: any) => ({
        ...char,
        seedValue: Math.floor(Math.random() * 999999) + 1
      }))

      // Update game state with story, choices, and image
      const { updateGameState } = useGameState()
      updateGameState({
        currentStoryText: storyData.storyText,
        currentChoices: storyData.choices,
        currentImageUrl: imageUrl,
        inventory: updatedInventory,
        currentQuest: updatedQuest,
        characters: newCharacters,
        storyHistory: [{
          userChoice: 'START',
          aiResponse: storyData.rawResponse,
          timestamp: Date.now()
        }]
      })

      // Activate game
      setIsGameActive(true)
    } catch (error) {
      console.error('Error starting new game:', error)
      alert('Failed to start new game. Please try again.')
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-amber-400 mb-4 font-serif">
          Narrai
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          AI-Powered Adventure Game
        </p>

        <div className="space-y-4">
          {hasSavedGame && (
            <button
              onClick={handleContinue}
              disabled={isStarting}
              className="w-full max-w-md mx-auto block px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-lg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue Adventure
            </button>
          )}

          <button
            onClick={handleNewGame}
            disabled={isStarting}
            className="w-full max-w-md mx-auto block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⚡</span>
                Starting Adventure...
              </span>
            ) : (
              hasSavedGame ? 'New Game' : 'Start Adventure'
            )}
          </button>
        </div>

        {isStarting && (
          <p className="mt-6 text-gray-500 text-sm">
            Generating your unique adventure... This may take a moment.
          </p>
        )}
      </div>
    </div>
  )
}
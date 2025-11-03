'use client'

import { useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { StoryDisplay } from './StoryDisplay'
import { ChoiceButtons } from './ChoiceButtons'
import { Sidebar } from './Sidebar'

export function GameContainer() {
  const { gameState, updateGameState } = useGameState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!gameState) {
    return <div>Loading...</div>
  }

  const handlePlayerChoice = async (choice: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call story generation API
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyHistory: gameState.storyHistory,
          playerChoice: choice,
          gameState: {
            inventory: gameState.inventory,
            currentQuest: gameState.currentQuest,
            characters: gameState.characters
          }
        })
      })

      if (!storyResponse.ok) {
        throw new Error('Failed to generate story')
      }

      const storyData = await storyResponse.json()

      // Call image generation API
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: storyData.imagePrompt,
          sessionSeed: gameState.sessionSeed,
          characters: gameState.characters
        })
      })

      let imageUrl = gameState.currentImageUrl
      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        imageUrl = imageData.imageUrl
      }

      // Apply state updates
      const { stateUpdates } = storyData

      // Update inventory
      let updatedInventory = [...gameState.inventory]
      if (stateUpdates.inventoryAdd && stateUpdates.inventoryAdd.length > 0) {
        updatedInventory = [...updatedInventory, ...stateUpdates.inventoryAdd]
      }
      if (stateUpdates.inventoryRemove && stateUpdates.inventoryRemove.length > 0) {
        updatedInventory = updatedInventory.filter(
          item => !stateUpdates.inventoryRemove.includes(item)
        )
      }

      // Update quest
      let updatedQuest = gameState.currentQuest
      if (stateUpdates.questComplete) {
        updatedQuest = null
      }
      if (stateUpdates.questUpdate) {
        updatedQuest = stateUpdates.questUpdate
      }

      // Update characters
      let updatedCharacters = [...gameState.characters]
      if (stateUpdates.newCharacters && stateUpdates.newCharacters.length > 0) {
        const newChars = stateUpdates.newCharacters.map((char: any) => ({
          name: char.name,
          description: char.description,
          seedValue: Math.floor(Math.random() * 999999) + 1
        }))
        updatedCharacters = [...updatedCharacters, ...newChars]
      }

      // Update story history
      const updatedHistory = [
        ...gameState.storyHistory,
        {
          userChoice: choice,
          aiResponse: storyData.rawResponse,
          timestamp: Date.now()
        }
      ]

      // Update game state
      updateGameState({
        currentStoryText: storyData.storyText,
        currentChoices: storyData.choices,
        currentImageUrl: imageUrl,
        inventory: updatedInventory,
        currentQuest: updatedQuest,
        characters: updatedCharacters,
        storyHistory: updatedHistory
      })
    } catch (err) {
      console.error('Error handling player choice:', err)
      setError('Failed to generate next part of the story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <StoryDisplay
            imageUrl={gameState.currentImageUrl}
            storyText={gameState.currentStoryText}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {!isLoading && gameState.currentChoices.length > 0 && (
            <ChoiceButtons
              choices={gameState.currentChoices}
              onChoiceSelect={handlePlayerChoice}
              disabled={isLoading}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        inventory={gameState.inventory}
        currentQuest={gameState.currentQuest}
      />
    </div>
  )
}
import { NextRequest, NextResponse } from 'next/server'
import { generateStory } from '@/lib/gemini'
import { parseGameState } from '@/lib/parseGameState'
import { INITIAL_SCENARIO_PROMPT } from '@/lib/prompts'
import { Character } from '@/types/game'

interface RequestBody {
  storyHistory: Array<{userChoice: string, aiResponse: string}>
  playerChoice: string
  gameState: {
    inventory: string[]
    currentQuest: string | null
    characters: Character[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { storyHistory, playerChoice, gameState } = body

    // Validate request body
    if (!playerChoice || !gameState) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Check if this is the initial game generation
    const isInitialGeneration = playerChoice === 'START'

    // Build conversation history for Claude
    const conversationHistory = storyHistory.map(turn => [
      { role: 'user', content: turn.userChoice },
      { role: 'assistant', content: turn.aiResponse }
    ]).flat()

    // Use INITIAL_SCENARIO_PROMPT for START, otherwise use player choice
    const promptToUse = isInitialGeneration ? INITIAL_SCENARIO_PROMPT : playerChoice

    // Call Claude API
    const aiResponse = await generateStory({
      storyHistory: conversationHistory,
      playerChoice: promptToUse,
      gameState
    })

    // Parse the AI response for game state updates
    const parsed = parseGameState(aiResponse)

    // Return structured response
    return NextResponse.json({
      storyText: parsed.cleanText,
      choices: parsed.choices,
      imagePrompt: parsed.imagePrompt,
      stateUpdates: {
        inventoryAdd: parsed.inventoryAdd,
        inventoryRemove: parsed.inventoryRemove,
        questUpdate: parsed.questUpdate,
        questComplete: parsed.questComplete,
        newCharacters: parsed.newCharacters
      },
      rawResponse: aiResponse
    })
  } catch (error) {
    console.error('Story generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}
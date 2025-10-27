import { GoogleGenerativeAI } from '@google/generative-ai'
import { GAME_MASTER_PROMPT } from './prompts'
import { Character } from '@/types/game'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

interface GenerateStoryParams {
  storyHistory: Array<{role: string, content: string}>
  playerChoice: string
  gameState: {
    inventory: string[]
    currentQuest: string | null
    characters: Character[]
  }
}

export async function generateStory(params: GenerateStoryParams): Promise<string> {
  const { storyHistory, playerChoice, gameState } = params

  // Build system prompt with current game state context
  const gameStateContext = `
Current Game State:
- Inventory: ${gameState.inventory.length > 0 ? gameState.inventory.join(', ') : 'empty'}
- Active Quest: ${gameState.currentQuest || 'none'}
- Known Characters: ${gameState.characters.map(c => `${c.name} (${c.description})`).join('; ') || 'none'}
`

  const systemPrompt = GAME_MASTER_PROMPT + '\n\n' + gameStateContext

  // Get Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1500,
    }
  })

  // Build chat history for Gemini
  const history = storyHistory.map(turn => ({
    role: turn.role === 'user' ? 'user' : 'model',
    parts: [{ text: turn.content }]
  }))

  // Retry logic for API rate limits
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      const chat = model.startChat({ history })
      const result = await chat.sendMessage(playerChoice)
      const response = result.response
      const text = response.text()

      return text
    } catch (error) {
      attempts++
      if (attempts >= maxAttempts) {
        throw error
      }
      // Exponential backoff: wait 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)))
    }
  }

  throw new Error('Failed to generate story after multiple attempts')
}
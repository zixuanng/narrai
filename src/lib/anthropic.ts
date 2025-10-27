import Anthropic from '@anthropic-ai/sdk'
import { GAME_MASTER_PROMPT } from './prompts'
import { Character } from '@/types/game'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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

  // Build messages array from history
  const messages: Anthropic.MessageParam[] = [
    ...storyHistory.map(turn => ({
      role: turn.role as 'user' | 'assistant',
      content: turn.content
    })),
    {
      role: 'user' as const,
      content: playerChoice
    }
  ]

  // Retry logic for API rate limits
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.9,
        system: systemPrompt,
        messages: messages
      })

      const textContent = response.content.find(block => block.type === 'text')
      if (textContent && textContent.type === 'text') {
        return textContent.text
      }

      throw new Error('No text content in Claude response')
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
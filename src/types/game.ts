export interface Character {
  name: string
  description: string
  seedValue: number  // For image consistency
}

export interface StoryTurn {
  userChoice: string
  aiResponse: string
  timestamp: number
}

export interface GameState {
  sessionId: string
  storyHistory: StoryTurn[]
  currentStoryText: string
  currentChoices: string[]
  currentImageUrl: string | null
  inventory: string[]
  currentQuest: string | null
  characters: Character[]
  sessionSeed: number
  createdAt: number
  lastUpdatedAt: number
}

export interface StateUpdate {
  inventoryAdd?: string[]
  inventoryRemove?: string[]
  questUpdate?: string | null
  questComplete?: boolean
  newCharacters?: Array<{name: string, description: string}>
}
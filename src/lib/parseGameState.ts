export interface ParsedGameState {
  cleanText: string
  inventoryAdd: string[]
  inventoryRemove: string[]
  questUpdate: string | null
  questComplete: boolean
  newCharacters: Array<{name: string, description: string}>
  imagePrompt: string
  choices: string[]
}

export function parseGameState(aiResponse: string): ParsedGameState {
  const result: ParsedGameState = {
    cleanText: aiResponse,
    inventoryAdd: [],
    inventoryRemove: [],
    questUpdate: null,
    questComplete: false,
    newCharacters: [],
    imagePrompt: '',
    choices: []
  }

  // Extract INVENTORY_ADD items
  const inventoryAddPattern = /\[INVENTORY_ADD:\s*([^\]]+)\]/g
  let match
  while ((match = inventoryAddPattern.exec(aiResponse)) !== null) {
    result.inventoryAdd.push(match[1].trim())
  }

  // Extract INVENTORY_REMOVE items
  const inventoryRemovePattern = /\[INVENTORY_REMOVE:\s*([^\]]+)\]/g
  while ((match = inventoryRemovePattern.exec(aiResponse)) !== null) {
    result.inventoryRemove.push(match[1].trim())
  }

  // Extract QUEST_UPDATE
  const questUpdatePattern = /\[QUEST_UPDATE:\s*([^\]]+)\]/
  const questUpdateMatch = questUpdatePattern.exec(aiResponse)
  if (questUpdateMatch) {
    result.questUpdate = questUpdateMatch[1].trim()
  }

  // Check for QUEST_COMPLETE
  if (/\[QUEST_COMPLETE\]/.test(aiResponse)) {
    result.questComplete = true
  }

  // Extract CHARACTER_MET
  const characterMetPattern = /\[CHARACTER_MET:\s*([^,]+),\s*([^\]]+)\]/g
  while ((match = characterMetPattern.exec(aiResponse)) !== null) {
    result.newCharacters.push({
      name: match[1].trim(),
      description: match[2].trim()
    })
  }

  // Extract IMAGE_PROMPT
  const imagePromptPattern = /\[IMAGE_PROMPT:\s*([^\]]+)\]/
  const imagePromptMatch = imagePromptPattern.exec(aiResponse)
  if (imagePromptMatch) {
    result.imagePrompt = imagePromptMatch[1].trim()
  }

  // Extract CHOICES
  const choicesPattern = /\[CHOICES:\s*([^\]]+)\]/
  const choicesMatch = choicesPattern.exec(aiResponse)
  if (choicesMatch) {
    result.choices = choicesMatch[1]
      .split('|')
      .map(choice => choice.trim())
      .filter(choice => choice.length > 0)
  }

  // Remove all markers from text to create clean text
  result.cleanText = aiResponse
    .replace(/\[INVENTORY_ADD:[^\]]+\]/g, '')
    .replace(/\[INVENTORY_REMOVE:[^\]]+\]/g, '')
    .replace(/\[QUEST_UPDATE:[^\]]+\]/g, '')
    .replace(/\[QUEST_COMPLETE\]/g, '')
    .replace(/\[CHARACTER_MET:[^\]]+\]/g, '')
    .replace(/\[IMAGE_PROMPT:[^\]]+\]/g, '')
    .replace(/\[CHOICES:[^\]]+\]/g, '')
    .trim()

  return result
}
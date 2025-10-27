import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/googleImage'
import { Character } from '@/types/game'

interface RequestBody {
  prompt: string
  sessionSeed: number
  characters: Character[]
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { prompt, sessionSeed, characters } = body

    // Validate request body
    if (!prompt || !sessionSeed) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Build character seeds map
    const characterSeeds: Record<string, number> = {}
    if (characters && Array.isArray(characters)) {
      characters.forEach(char => {
        characterSeeds[char.name] = char.seedValue
      })
    }

    // Call Google Imagen API
    const imageUrl = await generateImage({
      prompt,
      sessionSeed,
      characterSeeds
    })

    return NextResponse.json({
      imageUrl,
      prompt
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
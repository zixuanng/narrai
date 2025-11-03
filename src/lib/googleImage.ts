import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

interface GenerateImageParams {
  prompt: string
  sessionSeed: number
  characterSeeds?: Record<string, number>
}

const ART_STYLE_PREFIX = 'fantasy illustration, painterly style, detailed artwork, cinematic composition'
const NEGATIVE_PROMPT = 'blurry, low quality, distorted, text, watermark, signature, letters, words'

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const { prompt, sessionSeed } = params

  // Enhance prompt with art style
  const enhancedPrompt = `${ART_STYLE_PREFIX}, ${prompt}. Avoid: ${NEGATIVE_PROMPT}. Seed: ${sessionSeed}`

  try {
    // Note: Google's Generative AI SDK supports Imagen through the imageGenerationModel
    // Using Imagen 3 for high-quality fantasy artwork
    const model = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-001'
    })

    // Create prediction with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Image generation timeout')), 30000)
    })

    const generationPromise = model.generateContent({
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        seed: sessionSeed
      }
    })

    const result = await Promise.race([generationPromise, timeoutPromise])
    const response = result.response

    // Extract image data URL from response
    // Imagen returns base64 encoded images
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      part => 'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
    )

    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
      // Return as data URL
      const base64Data = imagePart.inlineData.data
      const mimeType = imagePart.inlineData.mimeType
      return `data:${mimeType};base64,${base64Data}`
    }

    throw new Error('No image data in Imagen response')
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

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
  const enhancedPrompt = `${ART_STYLE_PREFIX}, ${prompt}`

  try {
    // Create prediction with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Image generation timeout')), 30000)
    })

    const generationPromise = replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: NEGATIVE_PROMPT,
          seed: sessionSeed,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      }
    )

    const output = await Promise.race([generationPromise, timeoutPromise]) as string[]

    // Extract image URL from output
    if (Array.isArray(output) && output.length > 0) {
      return output[0]
    }

    throw new Error('No image URL in Replicate response')
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}
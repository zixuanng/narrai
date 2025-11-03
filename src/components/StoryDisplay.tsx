import Image from 'next/image'

interface StoryDisplayProps {
  imageUrl: string | null
  storyText: string
  isLoading: boolean
}

export function StoryDisplay({ imageUrl, storyText, isLoading }: StoryDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Image section */}
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Generating scene...</p>
            </div>
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt="Story scene"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Image unavailable</p>
          </div>
        )}
      </div>

      {/* Story text section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <p className="text-gray-400">Generating next part of your adventure...</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
            {storyText}
          </p>
        )}
      </div>
    </div>
  )
}
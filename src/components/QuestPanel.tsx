interface QuestPanelProps {
  quest: string | null
}

export function QuestPanel({ quest }: QuestPanelProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-purple-400 mb-3 border-b border-purple-400/30 pb-2">
        Current Quest
      </h3>
      {quest ? (
        <p className="text-gray-300 text-sm italic leading-relaxed">
          {quest}
        </p>
      ) : (
        <p className="text-gray-500 italic text-sm">No active quest</p>
      )}
    </div>
  )
}
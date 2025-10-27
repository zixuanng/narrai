interface ChoiceButtonsProps {
  choices: string[]
  onChoiceSelect: (choice: string) => void
  disabled: boolean
}

export function ChoiceButtons({ choices, onChoiceSelect, disabled }: ChoiceButtonsProps) {
  return (
    <div className="space-y-3 mt-6">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onChoiceSelect(choice)}
          disabled={disabled}
          className={`
            w-full text-left p-4 rounded-lg border transition-all
            ${
              disabled
                ? 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-amber-500 cursor-pointer'
            }
          `}
        >
          <span className="text-amber-500 font-bold mr-3">{index + 1}.</span>
          {choice}
        </button>
      ))}
    </div>
  )
}
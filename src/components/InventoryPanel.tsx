interface InventoryPanelProps {
  items: string[]
}

export function InventoryPanel({ items }: InventoryPanelProps) {
  return (
    <div className="border-b border-gray-700 pb-4 mb-4">
      <h3 className="text-lg font-bold text-amber-400 mb-3 border-b border-amber-400/30 pb-2">
        Inventory
      </h3>
      {items.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No items yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start text-gray-300 text-sm"
            >
              <span className="text-amber-500 mr-2">✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
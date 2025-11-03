'use client'

import { useState } from 'react'
import { InventoryPanel } from './InventoryPanel'
import { QuestPanel } from './QuestPanel'

interface SidebarProps {
  inventory: string[]
  currentQuest: string | null
}

export function Sidebar({ inventory, currentQuest }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`
        bg-gray-800/50 border-l border-gray-700 transition-all duration-300 overflow-y-auto
        ${isCollapsed ? 'w-12' : 'w-80'}
        hidden lg:block
      `}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-4 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center justify-center"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          <InventoryPanel items={inventory} />
          <QuestPanel quest={currentQuest} />
        </div>
      )}
    </div>
  )
}
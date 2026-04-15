'use client'

/**
 * SuggestionCards — 提示词卡片组
 * 对应 TDD 1.4 首屏初始提示词 & 动态提示词（done 事件后展示）
 *
 * 横向可滚动，点击卡片触发 onSelect 回调（发送给 ChatInput/ChatPage）
 */

import React from 'react'

interface SuggestionCardsProps {
  suggestions: string[]
  /** 点击某张卡片时的回调 */
  onSelect: (text: string) => void
  /** 是否禁用（流式输出中） */
  disabled?: boolean
}

export default function SuggestionCards({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionCardsProps) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((text, idx) => (
        <button
          key={idx}
          onClick={() => !disabled && onSelect(text)}
          disabled={disabled}
          className={[
            'text-left',
            'rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5',
            'text-xs text-blue-700 leading-snug',
            'transition-colors duration-150',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-blue-100 hover:border-blue-200 cursor-pointer',
          ].join(' ')}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

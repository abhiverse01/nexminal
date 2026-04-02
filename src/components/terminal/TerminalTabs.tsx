'use client';

import React, { useCallback } from 'react';
import { X, Plus } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  active: boolean;
}

interface TerminalTabsProps {
  tabs: Tab[];
  theme: any;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onSelectTab: (id: string) => void;
}

export default function TerminalTabs({ tabs, theme, onAddTab, onCloseTab, onSelectTab }: TerminalTabsProps) {
  const handleTabClick = useCallback((e: React.MouseEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-close]')) return;
    onSelectTab(id);
  }, [onSelectTab]);

  return (
    <div className="flex items-center h-9 bg-black/30 border-b border-gray-800 overflow-x-auto terminal-scrollbar shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={(e) => handleTabClick(e, tab.id)}
          className={`
            flex items-center gap-1.5 px-3 h-full text-xs font-mono cursor-pointer
            border-r border-gray-800 select-none shrink-0
            transition-colors duration-150
            ${tab.active
              ? 'bg-black/60 text-white border-t-2 border-t-cyan-400'
              : 'bg-black/20 text-gray-500 hover:bg-black/40 hover:text-gray-300'
            }
          `}
        >
          <span className="truncate max-w-32">{tab.name}</span>
          {tabs.length > 1 && (
            <button
              data-close
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="p-0.5 rounded hover:bg-red-500/30 hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddTab}
        className="flex items-center justify-center w-9 h-full text-gray-500 hover:bg-black/40 hover:text-gray-300 transition-colors shrink-0"
        title="New Tab (Ctrl+Shift+T)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

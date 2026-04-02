'use client';

import React, { useCallback, useMemo } from 'react';
import { TerminalLine } from '@/lib/terminal/types';

interface TerminalOutputProps {
  lines: TerminalLine[];
  theme: any;
}

export default function TerminalOutput({ lines, theme }: TerminalOutputProps) {
  const renderLine = useCallback((line: TerminalLine) => {
    const typeStyles: Record<string, string> = {
      input: '',
      output: 'text-white/90',
      error: 'text-red-400',
      info: 'text-cyan-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      game: 'text-purple-400',
      ascii: 'text-white/80 whitespace-pre',
    };

    if (line.type === 'input') {
      return (
        <div key={line.id} className="flex items-center gap-1">
          <span style={{ color: theme?.colors?.green || '#50fa7b' }} className="font-bold">nexus</span>
          <span style={{ color: theme?.colors?.white || '#f8f8f2' }}>@</span>
          <span style={{ color: theme?.colors?.cyan || '#8be9fd' }} className="font-bold">nexus</span>
          <span style={{ color: theme?.colors?.white || '#f8f8f2' }}>:</span>
          <span style={{ color: theme?.colors?.blue || '#bd93f9' }}>{line.content.replace(/^nexus@nexus:[^$]+\$\s*/, '')}</span>
        </div>
      );
    }

    return (
      <div
        key={line.id}
        className={`${typeStyles[line.type] || 'text-white/90'} ${line.type === 'ascii' ? 'whitespace-pre font-mono' : ''}`}
        onClick={() => {
          if (line.content) {
            navigator.clipboard.writeText(line.content.replace(/<[^>]*>/g, ''));
          }
        }}
        title="Click to copy"
      >
        {line.html ? (
          <span dangerouslySetInnerHTML={{ __html: line.content }} />
        ) : (
          line.content
        )}
      </div>
    );
  }, [theme]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 terminal-scrollbar" id="terminal-output">
      <div className="space-y-0.5 text-sm font-mono leading-relaxed">
        {useMemo(() => lines.map(renderLine), [lines, renderLine])}
      </div>
    </div>
  );
}

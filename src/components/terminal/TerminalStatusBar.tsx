'use client';

import React from 'react';

interface TerminalStatusBarProps {
  cwd: string;
  sessionCount: number;
  themeName: string;
}

export default function TerminalStatusBar({ cwd, sessionCount, themeName }: TerminalStatusBarProps) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });

  const displayPath = cwd === '/home/nexus' ? '~' : cwd.startsWith('/home/nexus/') ? '~' + cwd.slice(11) : cwd;

  return (
    <div className="flex items-center justify-between h-6 px-3 text-[10px] font-mono bg-black/40 border-t border-gray-800 text-gray-500 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="text-green-400">●</span>
        <span>nexus</span>
        <span className="text-gray-600">|</span>
        <span>{displayPath}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
        <span className="text-gray-600">|</span>
        <span>{themeName}</span>
        <span className="text-gray-600">|</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

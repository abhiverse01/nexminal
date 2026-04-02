'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TerminalSession, CommandResult, GameState, TerminalLine } from '@/lib/terminal/types';
import { handleGameInput, renderGame } from '@/lib/terminal';

interface GameCanvasProps {
  session: TerminalSession;
  theme: any;
  onExitGame: () => void;
  onGameUpdate: (gameState: GameState) => void;
}

export default function GameCanvas({ session, theme, onExitGame, onGameUpdate }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderResult = useMemo<CommandResult>(() => {
    if (session.gameState && session.gameMode !== 'none') {
      return renderGame(session.gameMode, session.gameState);
    }
    return { output: '', lines: [], exitCode: 0 };
  }, [session.gameState, session.gameMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session.gameState || session.gameMode === 'none') return;

    // Handle game-over exit
    const state = session.gameState.data as Record<string, unknown>;
    if (state?.gameOver) {
      onExitGame();
      return;
    }

    const { updatedSession, result } = handleGameInput(session, e.key);
    onGameUpdate(updatedSession.gameState!);
  }, [session, onExitGame, onGameUpdate]);

  // Focus on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ background: theme?.background || '#282a36' }}
    >
      {renderResult.lines.length > 0 && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="font-mono text-sm leading-relaxed space-y-0.5">
            {renderResult.lines.map((line: TerminalLine) => (
              <div
                key={line.id}
                className={`
                  ${line.type === 'error' ? 'text-red-400' : ''}
                  ${line.type === 'success' ? 'text-green-400' : ''}
                  ${line.type === 'warning' ? 'text-yellow-400' : ''}
                  ${line.type === 'info' ? 'text-cyan-400' : ''}
                  ${!['error', 'success', 'warning', 'info'].includes(line.type) ? 'text-white/90' : ''}
                `}
              >
                {line.html ? (
                  <span dangerouslySetInnerHTML={{ __html: line.content }} />
                ) : (
                  line.content
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-2 py-1 text-xs text-gray-500 font-mono border-t border-gray-800 shrink-0">
        Press <span className="text-gray-400">Q</span> or <span className="text-gray-400">Esc</span> to exit game
      </div>
    </div>
  );
}

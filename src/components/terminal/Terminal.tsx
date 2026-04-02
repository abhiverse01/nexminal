'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TerminalSession, TerminalLine, FileNode, CommandResult, GameState, Theme, CompletionResult } from '@/lib/terminal/types';
import {
  createSession, createInitialOutput, getFileSystem, getTabCompletions,
  executeCommand, handleGameKey, getCurrentGameRender, getTheme, getThemeNames
} from '@/lib/terminal';
import { CommandHistory } from '@/lib/terminal/commandHistory';
import TerminalOutput from './TerminalOutput';
import TerminalInput from './TerminalInput';
import TerminalTabs from './TerminalTabs';
import TerminalStatusBar from './TerminalStatusBar';
import GameCanvas from './GameCanvas';

export default function Terminal() {
  const [sessions, setSessions] = useState<TerminalSession[]>(() => {
    const initial = createSession();
    initial.output = createInitialOutput();
    return [initial];
  });
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const [theme, setTheme] = useState<Theme>(getTheme('dracula'));
  const [fileSystem, setFileSystem] = useState<FileNode>(getFileSystem());
  const historyRef = useRef<Record<string, CommandHistory>>({});
  const scoresRef = useRef<Record<string, number>>({});

  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  // Initialize history for session
  useEffect(() => {
    if (!historyRef.current[activeSessionId]) {
      historyRef.current[activeSessionId] = new CommandHistory();
    }
  }, [activeSessionId]);

  const addOutputLines = useCallback((sessionId: string, newLines: TerminalLine[]) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, output: [...s.output, ...newLines] }
        : s
    ));
  }, []);

  const replaceOutputLines = useCallback((sessionId: string, newLines: TerminalLine[]) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, output: newLines }
        : s
    ));
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById('terminal-output');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const handleSubmit = useCallback((input: string) => {
    const history = historyRef.current[activeSessionId];
    if (!history) return;

    history.add(input);

    const inputLine: TerminalLine = {
      id: `input-${Date.now()}`,
      content: input,
      type: 'input',
    };

    addOutputLines(activeSessionId, [inputLine]);

    // Check if it's a game command
    const cmd = input.trim().split(/\s+/)[0]?.toLowerCase();

    if (activeSession.gameMode !== 'none') {
      // Exit game on any input if game over
      const state = activeSession.gameState?.data as any;
      if (state?.gameOver) {
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? { ...s, gameState: null, gameMode: 'none' as const }
            : s
        ));
        scrollToBottom();
        return;
      }
    }

    setSessions(prev => {
      const session = prev.find(s => s.id === activeSessionId);
      if (!session) return prev;

      const { result, updatedSession } = executeCommand(
        { ...session, history: history.getAll() },
        fileSystem,
        theme
      );

      // Handle theme change
      const themeArg = input.trim().split(/\s+/)[1];
      if (cmd === 'theme' && themeArg && themeArg !== 'list') {
        const newTheme = getTheme(themeArg);
        setTheme(newTheme);
      }

      // Handle history clear
      if (cmd === 'history' && input.includes('-c')) {
        history.clear();
      }

      // Update scores
      if (result.gameState && ['snake', 'tetris', '2048', 'trivia'].includes(result.gameMode || '')) {
        const data = result.gameState.data as any;
        if (data?.score !== undefined) {
          const gameKey = result.gameMode!;
          if (!scoresRef.current[gameKey] || data.score > scoresRef.current[gameKey]) {
            scoresRef.current[gameKey] = data.score;
          }
        }
      }

      // Handle clear
      if (result.clearScreen) {
        return prev.map(s =>
          s.id === activeSessionId
            ? { ...updatedSession, output: [] }
            : s
        );
      }

      // Handle exit
      if (cmd === 'exit' && prev.length > 1) {
        const newSessions = prev.filter(s => s.id !== activeSessionId);
        if (newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
        }
        return newSessions;
      }

      // Update session state
      const newOutput = [...updatedSession.output, ...result.lines];
      return prev.map(s =>
        s.id === activeSessionId
          ? { ...updatedSession, output: newOutput }
          : s
      );
    });

    scrollToBottom();
  }, [activeSessionId, activeSession, fileSystem, theme, addOutputLines, scrollToBottom]);

  const handleTabComplete = useCallback((input: string): CompletionResult | null => {
    return getTabCompletions(input, activeSession.cwd, fileSystem);
  }, [activeSession.cwd, fileSystem]);

  const handleHistoryPrev = useCallback((): string | null => {
    const history = historyRef.current[activeSessionId];
    return history?.getPrevious() || null;
  }, [activeSessionId]);

  const handleHistoryNext = useCallback((): string | null => {
    const history = historyRef.current[activeSessionId];
    return history?.getNext() || null;
  }, [activeSessionId]);

  const handleSearchMode = useCallback((query: string): string | null => {
    const history = historyRef.current[activeSessionId];
    if (!history || !query) return null;
    const matches = history.search(query);
    if (matches.length === 0) return null;
    return history.getByIndex(matches[0]) || null;
  }, [activeSessionId]);

  const handleExitSearch = useCallback(() => {
    // Just cancel search mode
  }, []);

  const handleAddTab = useCallback(() => {
    const newSession = createSession();
    newSession.output = createInitialOutput();
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setSessions(prev => {
      if (prev.length <= 1) return prev;
      const newSessions = prev.filter(s => s.id !== id);
      if (id === activeSessionId) {
        setActiveSessionId(newSessions[0].id);
      }
      return newSessions;
    });
  }, [activeSessionId]);

  const handleSelectTab = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleGameUpdate = useCallback((gameState: GameState) => {
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, gameState }
        : s
    ));
  }, [activeSessionId]);

  const handleExitGame = useCallback(() => {
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, gameState: null, gameMode: 'none' as const }
        : s
    ));
  }, [activeSessionId]);

  // Scroll to bottom when output changes
  useEffect(() => {
    scrollToBottom();
  }, [activeSession.output, scrollToBottom]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+T: New tab
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleAddTab();
      }
      // Ctrl+W: Close tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        handleCloseTab(activeSessionId);
      }
      // Ctrl+1-9: Switch tabs
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < sessions.length) {
          setActiveSessionId(sessions[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAddTab, handleCloseTab, activeSessionId, sessions]);

  const tabs = useMemo(() => sessions.map(s => ({
    id: s.id,
    name: s.name,
    active: s.id === activeSessionId,
  })), [sessions, activeSessionId]);

  // Auto-scroll for game mode changes
  useEffect(() => {
    if (activeSession.gameMode !== 'none') {
      scrollToBottom();
    }
  }, [activeSession.gameMode, scrollToBottom]);

  return (
    <div
      className="flex flex-col w-screen h-screen overflow-hidden"
      style={{
        background: theme.background,
        color: theme.foreground,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
      }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between h-10 px-3 bg-black/40 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-sm">⌨ NEXUS</span>
          <span className="text-gray-600 text-xs">Terminal v2.0</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme selector */}
          <select
            value={theme.name}
            onChange={(e) => setTheme(getTheme(e.target.value))}
            className="bg-transparent text-gray-400 text-xs border border-gray-700 rounded px-1.5 py-0.5 outline-none focus:border-cyan-500"
            data-no-focus="true"
          >
            {getThemeNames().map(name => (
              <option key={name} value={name} className="bg-gray-900">{name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">by Abhishek Shah</span>
        </div>
      </div>

      {/* Tabs */}
      <TerminalTabs
        tabs={tabs}
        theme={theme}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSession.gameMode !== 'none' && activeSession.gameState ? (
          <GameCanvas
            session={activeSession}
            theme={theme}
            onExitGame={handleExitGame}
            onGameUpdate={handleGameUpdate}
          />
        ) : (
          <>
            <TerminalOutput
              lines={activeSession.output}
              theme={theme}
            />
            <TerminalInput
              cwd={activeSession.cwd}
              theme={theme}
              onSubmit={handleSubmit}
              onTabComplete={handleTabComplete}
              onHistoryPrev={handleHistoryPrev}
              onHistoryNext={handleHistoryNext}
              onSearchMode={handleSearchMode}
              onExitSearch={handleExitSearch}
              autoFocus={true}
              disabled={false}
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <TerminalStatusBar
        cwd={activeSession.cwd}
        sessionCount={sessions.length}
        themeName={theme.name}
      />
    </div>
  );
}

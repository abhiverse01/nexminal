'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CompletionResult } from '@/lib/terminal/types';

interface TerminalInputProps {
  cwd: string;
  theme: any;
  onSubmit: (input: string) => void;
  onTabComplete: (input: string) => CompletionResult | null;
  onHistoryPrev: () => string | null;
  onHistoryNext: () => string | null;
  onSearchMode: (query: string) => string | null;
  onExitSearch: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function TerminalInput({
  cwd,
  theme,
  onSubmit,
  onTabComplete,
  onHistoryPrev,
  onHistoryNext,
  onSearchMode,
  onExitSearch,
  autoFocus = true,
  disabled = false,
}: TerminalInputProps) {
  const [input, setInput] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [completions, setCompletions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Handle global click to refocus
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('a') && !target.closest('[data-no-focus]')) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const displayPath = useCallback(() => {
    if (cwd === '/home/nexus') return '~';
    if (cwd.startsWith('/home/nexus/')) return '~' + cwd.slice(11);
    return cwd;
  }, [cwd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle search mode
    if (searchMode) {
      if (e.key === 'Escape') {
        setSearchMode(false);
        setSearchQuery('');
        onExitSearch();
        return;
      }
      if (e.key === 'Backspace' && searchQuery === '') {
        setSearchMode(false);
        onExitSearch();
        return;
      }
      if (e.key === 'Enter') {
        const match = onSearchMode(searchQuery);
        if (match) setInput(match);
        setSearchMode(false);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
        if (input.trim()) {
          onSubmit(input);
          setInput('');
          setCompletions([]);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prev = onHistoryPrev();
        if (prev !== null) setInput(prev);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const next = onHistoryNext();
        if (next !== null) setInput(next);
        break;
      case 'Tab':
        e.preventDefault();
        if (input) {
          const result = onTabComplete(input);
          if (result) {
            if (result.completions.length === 1) {
              const prefix = input.substring(0, input.lastIndexOf(result.prefix) + result.prefix.length);
              setInput(prefix + result.completions[0] + ' ');
              setCompletions([]);
            } else if (result.completions.length > 1) {
              setCompletions(result.completions);
            }
          }
        }
        break;
      case 'r':
        if (e.ctrlKey) {
          e.preventDefault();
          setSearchMode(true);
          setSearchQuery('');
        }
        break;
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          onSubmit('clear');
        }
        break;
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          setInput('');
          setCompletions([]);
        }
        break;
      case 'w':
        if (e.ctrlKey) {
          e.preventDefault();
          // Close tab - handled by parent
        }
        break;
    }
  }, [input, searchMode, searchQuery, disabled, onSubmit, onTabComplete, onHistoryPrev, onHistoryNext, onSearchMode, onExitSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchMode) {
      setSearchQuery(e.target.value);
      onSearchMode(e.target.value);
    } else {
      setInput(e.target.value);
      setCompletions([]);
    }
  }, [searchMode, onSearchMode]);

  const promptElement = useMemo(() => {
    if (searchMode) {
      return (
        <span className="text-red-400 font-bold whitespace-pre">
          (reverse-i-search)`{searchQuery}':&nbsp;
        </span>
      );
    }

    return (
      <>
        <span style={{ color: theme?.colors?.green || '#50fa7b' }} className="font-bold">nexus</span>
        <span style={{ color: theme?.colors?.white || '#f8f8f2' }}>@</span>
        <span style={{ color: theme?.colors?.cyan || '#8be9fd' }} className="font-bold">nexus</span>
        <span style={{ color: theme?.colors?.white || '#f8f8f2' }}>:</span>
        <span style={{ color: theme?.colors?.blue || '#bd93f9' }} className="font-bold">{displayPath()}</span>
        <span style={{ color: theme?.colors?.white || '#f8f8f2' }} className="font-bold">$ </span>
      </>
    );
  }, [searchMode, searchQuery, theme, displayPath]);

  return (
    <div className="flex flex-col">
      {completions.length > 1 && (
        <div className="px-4 py-1 text-xs font-mono bg-black/30 text-gray-400 border-t border-gray-800">
          {completions.slice(0, 10).join('  ')}
          {completions.length > 10 && `  (+${completions.length - 10} more)`}
        </div>
      )}
      <div className="flex items-center px-2 py-0.5 font-mono text-sm">
        <span className="whitespace-pre shrink-0">{promptElement}</span>
        <input
          ref={inputRef}
          type="text"
          value={searchMode ? searchQuery : input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-white font-mono text-sm caret-white"
          style={{ caretColor: theme?.cursor || '#f8f8f2' }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

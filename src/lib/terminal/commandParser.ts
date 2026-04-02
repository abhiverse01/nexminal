import { ParsedCommand } from './types';

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) return { command: '', args: [], flags: [], raw: '' };

  // Handle command chaining with && or ||
  const chainMatch = trimmed.match(/^(.+?)\s*(&&|\|\|)\s*(.+)$/);
  if (chainMatch) {
    const base = parseCommand(chainMatch[1]);
    return {
      ...base,
      chain: { operator: chainMatch[2] as '&&' || '||', command: chainMatch[3] },
    };
  }

  // Handle pipe
  const pipeMatch = trimmed.match(/^(.+?)\s*\|\s*(.+)$/);
  if (pipeMatch) {
    const base = parseCommand(pipeMatch[1]);
    return {
      ...base,
      pipe: pipeMatch[2],
    };
  }

  // Handle output redirection
  const redirectMatch = trimmed.match(/^(.+?)\s*(>>|>)\s*(.+)$/);
  if (redirectMatch) {
    const base = parseCommand(redirectMatch[1]);
    return {
      ...base,
      redirect: { mode: redirectMatch[2] as '>' | '>>', target: redirectMatch[3].trim() },
    };
  }

  // Parse into tokens
  const tokens = tokenize(trimmed);
  const command = tokens[0] || '';
  const rest = tokens.slice(1);
  const args: string[] = [];
  const flags: string[] = [];

  for (const token of rest) {
    if (token.startsWith('-')) {
      flags.push(token);
    } else {
      args.push(token);
    }
  }

  return { command, args, flags, raw: trimmed };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && !inSingle) {
      escaped = true;
      continue;
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if (char === ' ' && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

export function getCommandAliases(): Record<string, string> {
  return {
    'll': 'ls -la',
    'la': 'ls -a',
    'l': 'ls -CF',
    '..': 'cd ..',
    '...': 'cd ../..',
    cls: 'clear',
    'q': 'exit',
    c: 'clear',
    h: 'history',
    'md': 'mkdir',
    'rd': 'rmdir',
    'del': 'rm',
    'type': 'cat',
    'more': 'cat',
    'less': 'cat',
    bc: 'calc',
  };
}

export function resolveAlias(command: string, aliases: Record<string, string>): string {
  if (aliases[command]) return aliases[command];
  return command;
}

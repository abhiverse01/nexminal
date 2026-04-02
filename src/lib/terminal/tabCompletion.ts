import { CompletionResult } from './types';
import { resolvePath, listDirectory, getNode } from './virtualFileSystem';
import { FileNode } from './types';

const allCommands = [
  // Navigation
  'ls', 'cd', 'pwd', 'tree',
  // File ops
  'cat', 'touch', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'echo', 'write', 'head', 'tail',
  // System
  'whoami', 'hostname', 'uname', 'date', 'uptime', 'clear', 'cls', 'history', 'exit',
  'neofetch', 'top', 'htop', 'ps',
  // Network
  'ping', 'curl', 'ifconfig', 'ip', 'traceroute', 'ssh', 'wget',
  // Utilities
  'calc', 'bc', 'base64', 'md5', 'sha256', 'rev', 'sort', 'wc', 'grep', 'find',
  'diff', 'uniq', 'tr', 'xargs', 'sed',
  // Fun
  'cowsay', 'fortune', 'matrix', 'color', 'figlet', 'banner', 'lolcat', 'sl',
  'cmatrix', 'oneko',
  // Dev info
  'about', 'abhishek', 'dev', 'contact', 'resume', 'social',
  // Games
  'games', 'play', 'score',
  // Other
  'help', 'man', 'weather', 'todo', 'notes', 'theme', 'nano', 'alias',
  'export', 'env', 'printenv', 'which', 'whatis', 'df', 'free', 'cal',
  'stopwatch', 'timer', 'password', 'uuid', 'lorem', 'qr', 'logo',
];

const commandFlags: Record<string, string[]> = {
  ls: ['-l', '-a', '-la', '-R', '-lh', '-alh', '-lhR'],
  cd: ['~', '-', '..', '.'],
  mkdir: ['-p', '-v'],
  rm: ['-r', '-f', '-rf', '-i', '-v'],
  cp: ['-r', '-v', '-i', '-u'],
  mv: ['-v', '-i', '-f'],
  echo: ['-n', '-e'],
  cat: ['-n', '-b', '-s'],
  head: ['-n', '-c'],
  tail: ['-n', '-f', '-c'],
  grep: ['-i', '-v', '-r', '-n', '-c', '-w', '-l'],
  find: ['-name', '-type', '-size', '-mtime'],
  sort: ['-r', '-n', '-k', '-u', '-f'],
  tr: ['-d', '-s', 'a-z', 'A-Z'],
  sed: ['-i', '-e', 's/old/new/', 's/old/new/g'],
  base64: ['-d', '-w', '-i'],
  uname: ['-a', '-s', '-r', '-m', '-n', '-v'],
  df: ['-h', '-T', '-i'],
  free: ['-h', '-m', '-g', '-b'],
  history: ['-c'],
  cowsay: ['-f'],
  weather: ['--json', '--units'],
  todo: ['add', 'list', 'done', 'remove', 'clear'],
  notes: ['list', 'new', 'view', 'delete'],
  theme: ['list'],
  tree: ['-L'],
  ping: ['-c', '-i', '-W'],
  cal: ['-3', '-y', '-m'],
  timer: [],
  uniq: ['-c', '-d', '-u', '-i'],
  diff: ['-u', '-w', '-i', '-q'],
  wc: ['-l', '-w', '-c', '-m'],
};

export function getCompletions(input: string, cwd: string, fs: FileNode): CompletionResult {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length <= 1) {
    // Complete command names
    const prefix = parts[0] || '';
    const matches = allCommands.filter(cmd => cmd.startsWith(prefix.toLowerCase()));
    return { completions: matches, prefix };
  }

  // Complete arguments for commands
  const command = parts[0].toLowerCase();
  const lastPart = parts[parts.length - 1];

  // Check if completing flags
  if (lastPart.startsWith('-') && commandFlags[command]) {
    const matches = commandFlags[command].filter(f => f.startsWith(lastPart));
    return { completions: matches, prefix: lastPart };
  }

  // For commands that take file paths
  const fileCommands = ['ls', 'cd', 'cat', 'touch', 'mkdir', 'rmdir', 'rm', 'cp', 'mv',
    'head', 'tail', 'write', 'nano', 'find', 'diff', 'echo'];
  
  if (fileCommands.includes(command)) {
    return getPathCompletions(lastPart, cwd, fs);
  }

  // Cowsay animal completion
  if (command === 'cowsay') {
    const animals = ['cow', 'tux', 'dragon', 'turtle', 'ghost', 'cat', 'owl', 'stegosaurus', 'elephant'];
    if (lastPart === '-f') {
      return { completions: animals, prefix: '' };
    }
    // Check if we're after -f
    const fIndex = parts.indexOf('-f');
    if (fIndex !== -1 && parts.length === fIndex + 2) {
      const matches = animals.filter(a => a.startsWith(lastPart));
      return { completions: matches, prefix: lastPart };
    }
  }

  // Game name completion
  if (command === 'play') {
    const games = ['snake', 'tetris', '2048', 'trivia', '1', '2', '3', '4'];
    const matches = games.filter(g => g.startsWith(lastPart.toLowerCase()));
    return { completions: matches, prefix: lastPart };
  }

  return { completions: [], prefix: '' };
}

function getPathCompletions(partial: string, cwd: string, fs: FileNode): CompletionResult {
  let dirPath: string;
  let prefix: string;

  if (partial.startsWith('~')) {
    const expanded = '/home/nexus' + partial.slice(1);
    return getPathCompletions(expanded, cwd, fs);
  }

  const lastSlash = partial.lastIndexOf('/');
  if (lastSlash === -1) {
    dirPath = cwd;
    prefix = partial;
  } else {
    const basePath = partial.substring(0, lastSlash) || '/';
    dirPath = resolvePath(basePath, cwd);
    prefix = partial.substring(lastSlash + 1);
  }

  try {
    const entries = listDirectory(dirPath, fs);
    const matches = entries
      .filter(e => !e.hidden && e.name.startsWith(prefix))
      .map(e => e.name + (e.type === 'directory' ? '/' : ''));
    return { completions: matches, prefix };
  } catch {
    return { completions: [], prefix };
  }
}

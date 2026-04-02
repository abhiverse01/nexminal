export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  permissions: string;
  size: number;
  created: string;
  modified: string;
  hidden?: boolean;
}

export interface TerminalSession {
  id: string;
  name: string;
  history: string[];
  historyIndex: number;
  cwd: string;
  env: Record<string, string>;
  output: TerminalLine[];
  gameState: GameState | null;
  gameMode: 'none' | 'snake' | 'tetris' | '2048' | 'trivia' | 'text-adventure';
  previousCwd?: string;
  aliases: Record<string, string>;
  todos: TodoItem[];
  notes: NoteItem[];
  nanoFile?: string;
  nanoContent?: string;
  nanoCursor?: number;
  stopwatchStart?: number;
  stopwatchRunning?: boolean;
  searchQuery?: string;
  searchIndex?: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
}

export interface TerminalLine {
  id: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success' | 'warning' | 'game' | 'ascii';
  timestamp?: string;
  html?: boolean;
}

export interface CommandResult {
  output: string;
  lines: TerminalLine[];
  error?: string;
  exitCode: number;
  clearScreen?: boolean;
  changeCwd?: string;
  gameState?: GameState;
  gameMode?: string;
  setAlias?: { name: string; value: string };
  removeAlias?: string;
}

export interface GameState {
  type: string;
  data: Record<string, unknown>;
}

export interface Theme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  prompt: string;
  promptUser: string;
  promptPath: string;
  promptSymbol: string;
  colors: {
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    black: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
}

export interface CompletionResult {
  completions: string[];
  prefix: string;
}

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: string[];
  raw: string;
  pipe?: string;
  redirect?: { mode: '>' | '>>'; target: string };
  chain?: { operator: '&&' | '||'; command: string };
}

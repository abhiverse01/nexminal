import { GameState, CommandResult, TerminalLine } from '../types';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

interface TetrisState {
  board: (string | null)[][];
  current: Tetromino;
  next: TetrominoType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  width: number;
  height: number;
}

const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
};

const TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function randomType(): TetrominoType {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

function createTetromino(type: TetrominoType, x: number, y: number): Tetromino {
  const t = TETROMINOES[type];
  return { type, shape: t.shape.map(r => [...r]), color: t.color, x, y };
}

function createBoard(width: number, height: number): (string | null)[][] {
  return Array.from({ length: height }, () => Array(width).fill(null));
}

function collides(board: (string | null)[][], piece: Tetromino, dx = 0, dy = 0): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const nx = piece.x + x + dx;
        const ny = piece.y + y + dy;
        if (nx < 0 || nx >= board[0].length || ny >= board.length) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
  }
  return false;
}

function merge(board: (string | null)[][], piece: Tetromino): (string | null)[][] {
  const newBoard = board.map(r => [...r]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const ny = piece.y + y;
        const nx = piece.x + x;
        if (ny >= 0 && ny < newBoard.length && nx >= 0 && nx < newBoard[0].length) {
          newBoard[ny][nx] = piece.color;
        }
      }
    }
  }
  return newBoard;
}

function clearLines(board: (string | null)[][]): { board: (string | null)[][]; cleared: number } {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const cleared = board.length - newBoard.length;
  while (newBoard.length < board.length) {
    newBoard.unshift(Array(board[0].length).fill(null));
  }
  return { board: newBoard, cleared };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];
  for (let x = 0; x < cols; x++) {
    rotated[x] = [];
    for (let y = rows - 1; y >= 0; y--) {
      rotated[x].push(shape[y][x]);
    }
  }
  return rotated;
}

export function initTetris(): GameState {
  const width = 10;
  const height = 20;
  const first = createTetromino(randomType(), Math.floor(width / 2) - 1, 0);

  const state: TetrisState = {
    board: createBoard(width, height),
    current: first,
    next: randomType(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false,
    width,
    height,
  };

  return { type: 'tetris', data: state as unknown as Record<string, unknown> };
}

export function handleTetrisInput(gameState: GameState, key: string): GameState {
  const state = gameState.data as unknown as TetrisState;

  if (key === 'q' || key === 'Escape') {
    return { type: 'tetris', data: { ...state, gameOver: true } as unknown as Record<string, unknown> };
  }

  if (key === 'p' || key === ' ') {
    return { type: 'tetris', data: { ...state, paused: !state.paused } as unknown as Record<string, unknown> };
  }

  if (state.gameOver || state.paused) return gameState;

  const piece = { ...state.current, shape: state.current.shape.map(r => [...r]) };
  let board = state.board.map(r => [...r]);
  let newPiece = piece;
  let newScore = state.score;
  let newLines = state.lines;
  let newLevel = state.level;
  let gameOver = false;

  if (key === 'ArrowLeft' || key === 'a') {
    if (!collides(board, piece, -1, 0)) {
      newPiece = { ...piece, x: piece.x - 1 };
    }
  } else if (key === 'ArrowRight' || key === 'd') {
    if (!collides(board, piece, 1, 0)) {
      newPiece = { ...piece, x: piece.x + 1 };
    }
  } else if (key === 'ArrowDown' || key === 's') {
    if (!collides(board, piece, 0, 1)) {
      newPiece = { ...piece, y: piece.y + 1 };
      newScore += 1;
    }
  } else if (key === 'ArrowUp' || key === 'w') {
    const rotatedShape = rotate(piece.shape);
    const rotated = { ...piece, shape: rotatedShape };
    if (!collides(board, rotated, 0, 0)) {
      newPiece = rotated;
    } else if (!collides(board, rotated, -1, 0)) {
      newPiece = { ...rotated, x: rotated.x - 1 };
    } else if (!collides(board, rotated, 1, 0)) {
      newPiece = { ...rotated, x: rotated.x + 1 };
    }
  } else if (key === ' ') {
    // Hard drop
    while (!collides(board, newPiece, 0, 1)) {
      newPiece = { ...newPiece, y: newPiece.y + 1 };
      newScore += 2;
    }
  }

  // Check if piece should lock
  if (collides(board, newPiece, 0, 1)) {
    board = merge(board, newPiece);
    const { board: clearedBoard, cleared } = clearLines(board);
    board = clearedBoard;
    newLines += cleared;
    newScore += [0, 100, 300, 500, 800][cleared] * newLevel;
    newLevel = Math.floor(newLines / 10) + 1;

    // Spawn new piece
    const nextPiece = createTetromino(state.next, Math.floor(state.width / 2) - 1, 0);
    if (collides(board, nextPiece, 0, 0)) {
      gameOver = true;
    }
    newPiece = nextPiece;

    return {
      type: 'tetris',
      data: {
        ...state,
        board,
        current: newPiece,
        next: randomType(),
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
      } as unknown as Record<string, unknown>,
    };
  }

  return {
    type: 'tetris',
    data: {
      ...state,
      current: newPiece,
      score: newScore,
      lines: newLines,
      level: newLevel,
    } as unknown as Record<string, unknown>,
  };
}

export function renderTetris(gameState: GameState): CommandResult {
  const state = gameState.data as unknown as TetrisState;
  const lines: TerminalLine[] = [];

  lines.push(makeLine(`<span class="text-cyan-400 font-bold">🧱 TETRIS</span>  Score: <span class="text-yellow-400">${state.score}</span>  Lines: <span class="text-green-400">${state.lines}</span>  Level: <span class="text-red-400">${state.level}</span> ${state.paused ? '<span class="text-yellow-400">⏸ PAUSED</span>' : ''}`, 'output', true));

  // Build display board
  const display = state.board.map(r => [...r]);

  // Place current piece
  const piece = state.current;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const ny = piece.y + y;
        const nx = piece.x + x;
        if (ny >= 0 && ny < display.length && nx >= 0 && nx < display[0].length) {
          display[ny][nx] = piece.color;
        }
      }
    }
  }

  // Render
  lines.push(makeLine('┌' + '──'.repeat(state.width) + '┐', 'output'));
  for (let y = 0; y < state.height; y++) {
    let row = '│';
    for (let x = 0; x < state.width; x++) {
      const cell = display[y][x];
      if (cell) {
        row += `<span style="background-color:${cell};color:${cell}">██</span>`;
      } else {
        row += '<span class="text-gray-800">██</span>';
      }
    }
    row += '│';
    lines.push(makeLine(row, 'output', true));
  }
  lines.push(makeLine('└' + '──'.repeat(state.width) + '┘', 'output'));

  // Next piece
  const nextT = TETROMINOES[state.next];
  lines.push(makeLine(`<span class="text-gray-400">Next: </span>${nextT.shape.map(r => r.map(c => c ? `<span style="color:${nextT.color}">██</span>` : '  ').join('')).join('\n')}`, 'output', true));

  if (state.gameOver) {
    lines.push(makeLine('', 'output'));
    lines.push(makeLine(`<span class="text-red-400 font-bold">GAME OVER! Score: ${state.score} | Lines: ${state.lines}</span>`, 'error', true));
  } else {
    lines.push(makeLine('<span class="text-gray-500">←→ Move | ↑ Rotate | ↓ Drop | Space Hard Drop | P Pause</span>', 'output', true));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

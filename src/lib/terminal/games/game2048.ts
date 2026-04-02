import { GameState, CommandResult, TerminalLine } from '../types';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

interface Game2048State {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

const TILE_COLORS: Record<number, string> = {
  0: 'text-gray-700',
  2: 'text-white',
  4: 'text-cyan-300',
  8: 'text-green-400',
  16: 'text-yellow-400',
  32: 'text-orange-400',
  64: 'text-red-400',
  128: 'text-purple-400',
  256: 'text-blue-400',
  512: 'text-magenta-400',
  1024: 'text-yellow-300',
  2048: 'text-green-300',
};

const TILE_BG: Record<number, string> = {
  0: 'bg-gray-800',
  2: 'bg-gray-600',
  4: 'bg-cyan-900',
  8: 'bg-green-900',
  16: 'bg-yellow-900',
  32: 'bg-orange-900',
  64: 'bg-red-900',
  128: 'bg-purple-900',
  256: 'bg-blue-900',
  512: 'bg-fuchsia-900',
  1024: 'bg-yellow-800',
  2048: 'bg-green-700',
};

function addRandomTile(board: number[][]): number[][] {
  const newBoard = board.map(r => [...r]);
  const empty: [number, number][] = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (newBoard[y][x] === 0) empty.push([y, x]);
    }
  }
  if (empty.length === 0) return newBoard;
  const [y, x] = empty[Math.floor(Math.random() * empty.length)];
  newBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slide(row: number[]): { row: number[]; score: number; moved: boolean } {
  let score = 0;
  const filtered = row.filter(v => v !== 0);
  const result: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      score += merged;
      i += 2;
    } else {
      result.push(filtered[i]);
      i++;
    }
  }
  while (result.length < 4) result.push(0);
  const moved = row.some((v, idx) => v !== result[idx]);
  return { row: result, score, moved };
}

function move(board: number[][], direction: string): { board: number[][]; score: number; moved: boolean } {
  let newBoard = board.map(r => [...r]);
  let totalScore = 0;
  let moved = false;

  if (direction === 'left') {
    for (let y = 0; y < 4; y++) {
      const { row, score, moved: m } = slide(newBoard[y]);
      newBoard[y] = row;
      totalScore += score;
      moved = moved || m;
    }
  } else if (direction === 'right') {
    for (let y = 0; y < 4; y++) {
      const { row, score, moved: m } = slide([...newBoard[y]].reverse());
      newBoard[y] = row.reverse();
      totalScore += score;
      moved = moved || m;
    }
  } else if (direction === 'up') {
    for (let x = 0; x < 4; x++) {
      const col = [newBoard[0][x], newBoard[1][x], newBoard[2][x], newBoard[3][x]];
      const { row, score, moved: m } = slide(col);
      for (let y = 0; y < 4; y++) newBoard[y][x] = row[y];
      totalScore += score;
      moved = moved || m;
    }
  } else if (direction === 'down') {
    for (let x = 0; x < 4; x++) {
      const col = [newBoard[3][x], newBoard[2][x], newBoard[1][x], newBoard[0][x]];
      const { row, score, moved: m } = slide(col);
      for (let y = 0; y < 4; y++) newBoard[3 - y][x] = row[y];
      totalScore += score;
      moved = moved || m;
    }
  }

  return { board: newBoard, score: totalScore, moved };
}

function canMove(board: number[][]): boolean {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (board[y][x] === 0) return true;
      if (x < 3 && board[y][x] === board[y][x + 1]) return true;
      if (y < 3 && board[y][x] === board[y + 1][x]) return true;
    }
  }
  return false;
}

export function init2048(): GameState {
  let board: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  board = addRandomTile(board);
  board = addRandomTile(board);

  return {
    type: '2048',
    data: {
      board,
      score: 0,
      bestScore: 0,
      gameOver: false,
      won: false,
    } as unknown as Record<string, unknown>,
  };
}

export function handle2048Input(gameState: GameState, key: string): GameState {
  const state = gameState.data as unknown as Game2048State;

  if (key === 'q' || key === 'Escape') {
    return { type: '2048', data: { ...state, gameOver: true } as unknown as Record<string, unknown> };
  }

  if (state.gameOver) return gameState;

  let direction: string | null = null;
  if (key === 'ArrowLeft' || key === 'a') direction = 'left';
  if (key === 'ArrowRight' || key === 'd') direction = 'right';
  if (key === 'ArrowUp' || key === 'w') direction = 'up';
  if (key === 'ArrowDown' || key === 's') direction = 'down';

  if (!direction) return gameState;

  const { board: newBoard, score: addScore, moved } = move(state.board, direction);

  if (!moved) return gameState;

  const withNewTile = addRandomTile(newBoard);
  const newScore = state.score + addScore;
  const won = withNewTile.some(r => r.some(v => v === 2048));
  const gameOver = !canMove(withNewTile);

  return {
    type: '2048',
    data: {
      board: withNewTile,
      score: newScore,
      bestScore: Math.max(state.bestScore, newScore),
      gameOver,
      won,
    } as unknown as Record<string, unknown>,
  };
}

export function render2048(gameState: GameState): CommandResult {
  const state = gameState.data as unknown as Game2048State;
  const lines: TerminalLine[] = [];

  lines.push(makeLine(`<span class="text-cyan-400 font-bold">🔢 2048</span>  Score: <span class="text-yellow-400">${state.score}</span>  Best: <span class="text-green-400">${state.bestScore}</span>`, 'output', true));

  lines.push(makeLine('┌──────┬──────┬──────┬──────┐', 'output'));
  for (let y = 0; y < 4; y++) {
    let row1 = '│';
    let row2 = '│';
    for (let x = 0; x < 4; x++) {
      const val = state.board[y][x];
      const display = val === 0 ? '  ' : String(val).padStart(4);
      row1 += `      │`;
      row2 += `${display} │`;
    }
    lines.push(makeLine(row1, 'output'));
    lines.push(makeLine(row2, 'output'));
    lines.push(makeLine('├──────┼──────┼──────┼──────┤', 'output'));
  }

  if (state.gameOver) {
    if (state.won) {
      lines.push(makeLine('<span class="text-green-400 font-bold">🎉 YOU WON! 🎉 Score: ' + state.score + '</span>', 'success', true));
    } else {
      lines.push(makeLine(`<span class="text-red-400 font-bold">GAME OVER! Score: ${state.score}</span>`, 'error', true));
    }
  } else {
    lines.push(makeLine('<span class="text-gray-500">Arrow keys/WASD to slide tiles | Q to quit</span>', 'output', true));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

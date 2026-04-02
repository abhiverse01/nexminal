import { GameState, CommandResult, TerminalLine } from '../types';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

interface SnakeState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  speed: number;
  gameOver: boolean;
  paused: boolean;
  width: number;
  height: number;
}

export function initSnake(): GameState {
  const width = 20;
  const height = 16;
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const state: SnakeState = {
    snake: [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ],
    food: { x: Math.floor(Math.random() * (width - 4)) + 2, y: Math.floor(Math.random() * (height - 4)) + 2 },
    direction: 'right',
    score: 0,
    speed: 150,
    gameOver: false,
    paused: false,
    width,
    height,
  };

  return { type: 'snake', data: state as unknown as Record<string, unknown> };
}

export function handleSnakeInput(gameState: GameState, key: string): GameState {
  const state = gameState.data as unknown as SnakeState;
  const newState = { ...state, snake: state.snake.map(s => ({ ...s })), food: { ...state.food } };

  if (key === 'q' || key === 'Escape') {
    return { type: 'snake', data: { ...newState, gameOver: true } as unknown as Record<string, unknown> };
  }

  if (key === 'p' || key === ' ') {
    return { type: 'snake', data: { ...newState, paused: !newState.paused } as unknown as Record<string, unknown> };
  }

  if (newState.gameOver || newState.paused) return gameState;

  let newDir = newState.direction;
  if ((key === 'ArrowUp' || key === 'w') && newState.direction !== 'down') newDir = 'up';
  if ((key === 'ArrowDown' || key === 's') && newState.direction !== 'up') newDir = 'down';
  if ((key === 'ArrowLeft' || key === 'a') && newState.direction !== 'right') newDir = 'left';
  if ((key === 'ArrowRight' || key === 'd') && newState.direction !== 'left') newDir = 'right';

  if (newDir === newState.direction) return gameState;

  // Move the snake
  const head = { ...newState.snake[0] };
  if (newDir === 'up') head.y--;
  if (newDir === 'down') head.y++;
  if (newDir === 'left') head.x--;
  if (newDir === 'right') head.x++;

  // Check collisions
  if (head.x < 0 || head.x >= state.width || head.y < 0 || head.y >= state.height) {
    return { type: 'snake', data: { ...newState, direction: newDir, gameOver: true } as unknown as Record<string, unknown> };
  }

  for (const segment of newState.snake) {
    if (segment.x === head.x && segment.y === head.y) {
      return { type: 'snake', data: { ...newState, direction: newDir, gameOver: true } as unknown as Record<string, unknown> };
    }
  }

  const newSnake = [head, ...newState.snake];
  let newScore = newState.score;

  if (head.x === newState.food.x && head.y === newState.food.y) {
    newScore += 10;
  } else {
    newSnake.pop();
  }

  let newFood = newState.food;
  if (head.x === newState.food.x && head.y === newState.food.y) {
    newFood = {
      x: Math.floor(Math.random() * (state.width - 4)) + 2,
      y: Math.floor(Math.random() * (state.height - 4)) + 2,
    };
  }

  return {
    type: 'snake',
    data: {
      ...newState,
      snake: newSnake,
      food: newFood,
      direction: newDir,
      score: newScore,
      gameOver: false,
      speed: Math.max(50, newState.speed - 2),
    } as unknown as Record<string, unknown>,
  };
}

export function renderSnake(gameState: GameState): CommandResult {
  const state = gameState.data as unknown as SnakeState;
  const lines: TerminalLine[] = [];

  lines.push(makeLine(`<span class="text-green-400 font-bold">🐍 SNAKE</span>  Score: <span class="text-yellow-400">${state.score}</span>  ${state.paused ? '<span class="text-yellow-400">⏸ PAUSED</span>' : ''}`, 'output', true));

  // Build grid
  const grid: string[][] = [];
  for (let y = 0; y < state.height; y++) {
    grid[y] = [];
    for (let x = 0; x < state.width; x++) {
      grid[y][x] = ' ';
    }
  }

  // Place snake
  for (let i = 0; i < state.snake.length; i++) {
    const s = state.snake[i];
    if (s.y >= 0 && s.y < state.height && s.x >= 0 && s.x < state.width) {
      grid[s.y][s.x] = i === 0 ? '█' : '▓';
    }
  }

  // Place food
  if (state.food.y >= 0 && state.food.y < state.height && state.food.x >= 0 && state.food.x < state.width) {
    grid[state.food.y][state.food.x] = '●';
  }

  // Render
  lines.push(makeLine('┌' + '──'.repeat(state.width) + '┐', 'output'));
  for (let y = 0; y < state.height; y++) {
    let row = '│';
    for (let x = 0; x < state.width; x++) {
      const cell = grid[y][x];
      if (cell === '█') {
        row += '<span class="text-green-400 font-bold">██</span>';
      } else if (cell === '▓') {
        row += '<span class="text-green-600">██</span>';
      } else if (cell === '●') {
        row += '<span class="text-red-400">██</span>';
      } else {
        row += '<span class="text-gray-800">██</span>';
      }
    }
    row += '│';
    lines.push(makeLine(row, 'output', true));
  }
  lines.push(makeLine('└' + '──'.repeat(state.width) + '┘', 'output'));

  if (state.gameOver) {
    lines.push(makeLine('', 'output'));
    lines.push(makeLine(`<span class="text-red-400 font-bold">GAME OVER! Score: ${state.score}</span>`, 'error', true));
    lines.push(makeLine('<span class="text-gray-400">Press any key to continue...</span>', 'output', true));
  } else {
    lines.push(makeLine('<span class="text-gray-500">Arrow keys/WASD to move | P to pause | Q to quit</span>', 'output', true));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

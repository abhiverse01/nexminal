import { CommandResult, TerminalLine, GameState } from '../types';
import { makeBox } from '../asciiArt';
import { initSnake, handleSnakeInput, renderSnake } from '../games/snake';
import { initTetris, handleTetrisInput, renderTetris } from '../games/tetris';
import { init2048, handle2048Input, render2048 } from '../games/game2048';
import { initTrivia, handleTriviaInput, renderTrivia } from '../games/trivia';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeGames(): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine(makeBox('🎮 NEXUS GAME ARCADE 🎮', 'double', 40), 'output'));
  lines.push(makeLine(makeBox('', 'double', 40).split('\n')[0], 'output'));

  const games = [
    ['1', '🐍 Snake', 'Classic snake game with arrow keys'],
    ['2', '🧱 Tetris', 'Stack blocks, clear lines'],
    ['3', '🔢 2048', 'Slide & merge tiles to 2048'],
    ['4', '🧠 Trivia Quiz', 'Test your knowledge'],
  ];

  for (const [num, name, desc] of games) {
    lines.push(makeLine(`  ${num}. ${name.padEnd(18)} - ${desc}`, 'output'));
  }

  lines.push(makeLine(makeBox('', 'double', 40).split('\n').pop() || '', 'output'));
  lines.push(makeLine('', 'output'));
  lines.push(makeLine(`<span class="text-cyan-400">Type: play <game-number> or play <name></span>`, 'output', true));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function launchGame(gameName: string): CommandResult {
  const name = gameName.toLowerCase().trim();

  let gameState: GameState;
  let gameMode: string;

  switch (name) {
    case '1':
    case 'snake':
      gameState = initSnake();
      gameMode = 'snake';
      break;
    case '2':
    case 'tetris':
      gameState = initTetris();
      gameMode = 'tetris';
      break;
    case '3':
    case '2048':
      gameState = init2048();
      gameMode = '2048';
      break;
    case '4':
    case 'trivia':
      gameState = initTrivia();
      gameMode = 'trivia';
      break;
    default:
      return {
        output: `Unknown game: ${gameName}. Available: snake, tetris, 2048, trivia`,
        lines: [makeLine(`Unknown game: ${gameName}`, 'error')],
        exitCode: 1,
      };
  }

  return {
    output: '',
    lines: [],
    exitCode: 0,
    gameState,
    gameMode,
  };
}

export function handleGameInput(gameMode: string, gameState: GameState, key: string): { newState: GameState; result: CommandResult | null } {
  switch (gameMode) {
    case 'snake': {
      const newState = handleSnakeInput(gameState, key);
      const render = renderSnake(newState);
      return { newState, result: render };
    }
    case 'tetris': {
      const newState = handleTetrisInput(gameState, key);
      const render = renderTetris(newState);
      return { newState, result: render };
    }
    case '2048': {
      const newState = handle2048Input(gameState, key);
      const render = render2048(newState);
      return { newState, result: render };
    }
    case 'trivia': {
      const newState = handleTriviaInput(gameState, key);
      const render = renderTrivia(newState);
      return { newState, result: render };
    }
    default:
      return { newState: gameState, result: null };
  }
}

export function renderGame(gameMode: string, gameState: GameState): CommandResult {
  switch (gameMode) {
    case 'snake': return renderSnake(gameState);
    case 'tetris': return renderTetris(gameState);
    case '2048': return render2048(gameState);
    case 'trivia': return renderTrivia(gameState);
    default: return { output: '', lines: [], exitCode: 0 };
  }
}

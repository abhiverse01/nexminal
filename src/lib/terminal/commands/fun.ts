import { CommandResult, TerminalLine } from '../types';
import { getFortune } from '../fortune';
import { generateCowsay, generateFiglet, slArt, matrixChars, cowsayAnimals } from '../asciiArt';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeCowsay(args: string[]): CommandResult {
  const animal = (() => {
    const fIdx = args.indexOf('-f');
    return fIdx !== -1 && args[fIdx + 1] ? args[fIdx + 1] : 'cow';
  })();

  const text = args.filter(a => !a.startsWith('-')).join(' ') || 'Moo!';

  if (!cowsayAnimals[animal]) {
    return {
      output: `cowsay: unknown animal: ${animal}. Available: ${Object.keys(cowsayAnimals).join(', ')}`,
      lines: [makeLine(`Available animals: ${Object.keys(cowsayAnimals).join(', ')}`, 'error')],
      exitCode: 1,
    };
  }

  const art = generateCowsay(text, animal);
  return { output: art, lines: [makeLine(art, 'ascii')], exitCode: 0 };
}

export function executeFortune(): CommandResult {
  const fortune = getFortune();
  return { output: fortune, lines: [makeLine(fortune, 'info')], exitCode: 0 };
}

export function executeMatrix(): CommandResult {
  const lines: TerminalLine[] = [];
  const width = 60;
  const height = 20;
  let matrix = '';

  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.7) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const brightness = Math.random();
        if (brightness > 0.8) {
          line += `<span style="color:#ffffff;font-weight:bold">${char}</span>`;
        } else if (brightness > 0.4) {
          line += `<span style="color:#00ff41">${char}</span>`;
        } else {
          line += `<span style="color:#003300">${char}</span>`;
        }
      } else {
        line += ' ';
      }
    }
    matrix += line + '\n';
  }

  lines.push(makeLine(matrix.trim(), 'ascii', true));
  lines.push(makeLine('<span class="text-green-400">Wake up, Neo...</span>', 'info', true));

  return { output: matrix, lines, exitCode: 0 };
}

export function executeColor(args: string[]): CommandResult {
  const text = args.join(' ');
  if (!text) {
    return { output: 'Usage: color <text>', lines: [makeLine('Usage: color <text>', 'error')], exitCode: 1 };
  }

  const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
  let html = '';
  for (let i = 0; i < text.length; i++) {
    const color = rainbowColors[i % rainbowColors.length];
    html += `<span style="color:${color};font-weight:bold">${text[i]}</span>`;
  }

  return { output: text, lines: [makeLine(html, 'output', true)], exitCode: 0 };
}

export function executeFiglet(args: string[]): CommandResult {
  const text = args.join(' ') || 'NEXUS';
  if (text.length > 20) {
    return { output: 'Text too long (max 20 characters)', lines: [makeLine('Text too long (max 20 characters)', 'error')], exitCode: 1 };
  }
  const art = generateFiglet(text);
  return { output: art, lines: [makeLine(art, 'ascii')], exitCode: 0 };
}

export function executeLolcat(args: string[]): CommandResult {
  return executeColor(args);
}

export function executeSl(): CommandResult {
  const lines: TerminalLine[] = [];
  for (const frame of slArt) {
    lines.push(makeLine(frame, 'ascii'));
  }
  return { output: slArt.join('\n'), lines, exitCode: 0 };
}

export function executeCmatrix(): CommandResult {
  return executeMatrix();
}

export function executeOneko(): CommandResult {
  const lines: TerminalLine[] = [];
  const catFrames = [
    '     /\\_/\\  ',
    '    ( o.o ) ',
    '     > ^ <  ',
    '    /|   |\\ ',
    '   (_|   |_)',
  ];

  const walkFrames = [
    '  /\\_/\\      ',
    ' ( o.o ) >>  ',
    '  > ^ <      ',
    ' /|   |\\     ',
    '(_|   |_)    ',
  ];

  lines.push(makeLine(`<span class="text-yellow-400">  /\\_/\\  </span>  <span class="text-gray-400">/\\_/\\</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-yellow-400"> ( o.o ) </span>  <span class="text-gray-400">( -.- )</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-yellow-400">  > ^ <  </span>  <span class="text-gray-400"> > ^ < </span>`, 'output', true));
  lines.push(makeLine(`<span class="text-yellow-400"> /|   |\\ </span>  <span class="text-gray-400">/|   |\\</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-yellow-400">(_|   |_)</span>  <span class="text-gray-400">(_|   |_)</span>`, 'output', true));
  lines.push(makeLine('', 'output'));
  lines.push(makeLine('🐱 Oneko! A cat is walking on your terminal...', 'info'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

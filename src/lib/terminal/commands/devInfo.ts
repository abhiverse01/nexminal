import { CommandResult, TerminalLine } from '../types';
import { makeBox, makeMultiBox, abhishekAscii } from '../asciiArt';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeAbout(): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine(abhishekAscii, 'ascii'));

  lines.push(makeLine('', 'output'));

  lines.push(makeLine(makeMultiBox([
    '     ABHISHEK SHAH',
    '     Software Developer',
    '',
    '  📧  LinkedIn:  linkedin.com/in/theabhishekshah',
    '  🐙  GitHub:    github.com/abhiverse01',
    '  🖥️  Terminal:   NEXUS Terminal v2.0',
    '',
    '  "Building the future, one commit at a time"',
  ], 'double', 52), 'output'));

  lines.push(makeLine('', 'output'));
  lines.push(makeLine(`<span class="text-cyan-400">Welcome to my terminal!</span> Type <span class="text-yellow-400">help</span> to explore all features.`, 'output', true));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeContact(): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine(makeMultiBox([
    '  📬 CONTACT INFORMATION',
    '',
    '  Name:     Abhishek Shah',
    '  LinkedIn: linkedin.com/in/theabhishekshah',
    '  GitHub:   github.com/abhiverse01',
    '',
    '  📧 Drop a message on LinkedIn!',
  ], 'round', 46), 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeResume(): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine(makeMultiBox([
    '╔══════════════════════════════════════════╗',
    '║         RESUME - ABHISHEK SHAH          ║',
    '╠══════════════════════════════════════════╣',
    '║                                          ║',
    '║  ROLE: Software Developer                 ║',
    '║  FOCUS: Full-Stack, Cloud, DevOps         ║',
    '║                                          ║',
    '║  SKILLS:                                 ║',
    '║  • TypeScript / JavaScript / Python       ║',
    '║  • React / Next.js / Node.js             ║',
    '║  • Docker / Kubernetes / AWS              ║',
    '║  • PostgreSQL / MongoDB / Redis           ║',
    '║  • Git / CI/CD / Agile                   ║',
    '║                                          ║',
    '║  PROJECTS:                               ║',
    '║  • NEXUS Terminal - Browser Terminal      ║',
    '║  • Web Applications & APIs               ║',
    '║  • Cloud Infrastructure                   ║',
    '║                                          ║',
    '╚══════════════════════════════════════════╝',
  ], 'double', 48), 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeSocial(): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine(makeMultiBox([
    '  🔗 SOCIAL LINKS',
    '',
    '  ┌─────────────────────────────────────┐',
    '  │ 💼 LinkedIn                          │',
    '  │    linkedin.com/in/theabhishekshah   │',
    '  ├─────────────────────────────────────┤',
    '  │ 🐙 GitHub                            │',
    '  │    github.com/abhiverse01             │',
    '  ├─────────────────────────────────────┤',
    '  │ 🖥️  Portfolio                         │',
    '  │    Coming Soon...                     │',
    '  └─────────────────────────────────────┘',
  ], 'round', 46), 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

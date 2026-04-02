import { CommandResult, TerminalLine, FileNode } from '../types';
import { resolvePath, getNode } from '../virtualFileSystem';
import { expandTilde } from '../environment';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeCalc(args: string[]): CommandResult {
  const expression = args.join(' ');
  if (!expression) {
    return { output: 'Usage: calc <expression>\nExample: calc 2 + 3 * 4', lines: [makeLine('Usage: calc <expression>\nExample: calc 2 + 3 * 4', 'error')], exitCode: 1 };
  }

  try {
    // Replace ^ with ** for power
    const processed = expression.replace(/\^/g, '**');
    // Replace % with modulo
    // Use Function constructor for safe math evaluation
    const sanitized = processed.replace(/[^0-9+\-*/().%\s]/g, '');
    if (sanitized !== processed && !/^[0-9+\-*/().%\s^]+$/.test(processed)) {
      throw new Error('Invalid expression');
    }
    
    const result = new Function(`"use strict"; return (${processed})`)();
    
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Invalid result');
    }

    const output = `= ${result}`;
    return { output, lines: [makeLine(`<span class="text-green-400">${expression}</span> = <span class="text-yellow-400">${result}</span>`, 'output', true)], exitCode: 0 };
  } catch {
    return { output: `calc: invalid expression: ${expression}`, lines: [makeLine(`calc: invalid expression: ${expression}`, 'error')], exitCode: 1 };
  }
}

export function executeBase64(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: 'Usage: base64 <text> [-d to decode]', lines: [makeLine('Usage: base64 <text> [-d to decode]', 'error')], exitCode: 1 };
  }

  const decode = args.includes('-d');
  const text = args.filter(a => !a.startsWith('-')).join(' ');

  try {
    let result: string;
    if (decode) {
      result = atob(text);
    } else {
      result = btoa(text);
    }
    return { output: result, lines: [makeLine(result)], exitCode: 0 };
  } catch {
    return { output: 'base64: invalid input', lines: [makeLine('base64: invalid input', 'error')], exitCode: 1 };
  }
}

export function executeMd5(args: string[]): CommandResult {
  const text = args.filter(a => !a.startsWith('-')).join(' ');
  if (!text) {
    return { output: 'Usage: md5 <text>', lines: [makeLine('Usage: md5 <text>', 'error')], exitCode: 1 };
  }

  // Simple hash simulation
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  // Generate 32 char fake md5
  const fullHash = (hexHash.repeat(8)).substring(0, 32);

  return { output: `MD5 ("${text}") = ${fullHash}`, lines: [makeLine(`MD5 ("<span class="text-cyan-400">${text}</span>") = <span class="text-yellow-400">${fullHash}</span>`, 'output', true)], exitCode: 0 };
}

export function executeSha256(args: string[]): CommandResult {
  const text = args.filter(a => !a.startsWith('-')).join(' ');
  if (!text) {
    return { output: 'Usage: sha256 <text>', lines: [makeLine('Usage: sha256 <text>', 'error')], exitCode: 1 };
  }

  // Simple hash simulation
  let hash = '';
  for (let i = 0; i < 64; i++) {
    let h = 0;
    for (let j = 0; j < text.length; j++) {
      h = ((h << 5) - h + text.charCodeAt(j) * (i + 1)) & 0xff;
    }
    hash += Math.abs(h).toString(16).padStart(2, '0');
  }

  return { output: `SHA256 ("${text}") = ${hash}`, lines: [makeLine(`SHA256 ("<span class="text-cyan-400">${text}</span>") = <span class="text-yellow-400">${hash}</span>`, 'output', true)], exitCode: 0 };
}

export function executeRev(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: '', lines: [], exitCode: 0 };
  }
  const text = args.join(' ');
  return { output: text.split('').reverse().join(''), lines: [makeLine(text.split('').reverse().join(''))], exitCode: 0 };
}

export function executeSort(args: string[], cwd: string, fs: FileNode): CommandResult {
  const reverse = args.includes('-r');
  const numeric = args.includes('-n');
  const textArgs = args.filter(a => !a.startsWith('-'));

  let lines: string[];
  
  if (textArgs.length === 0) {
    return { output: 'Usage: sort [options] <text or file>', lines: [makeLine('Usage: sort [options] <text or file>', 'error')], exitCode: 1 };
  }

  const filePath = resolvePath(expandTilde(textArgs[0], '/home/nexus'), cwd);
  const node = getNode(filePath, fs);
  
  if (node && node.type === 'file' && node.content) {
    lines = node.content.split('\n');
  } else {
    lines = textArgs;
  }

  lines.sort((a, b) => {
    if (numeric) {
      return (parseFloat(a) || 0) - (parseFloat(b) || 0);
    }
    return a.localeCompare(b);
  });

  if (reverse) lines.reverse();

  return { output: lines.join('\n'), lines: lines.map(l => makeLine(l)), exitCode: 0 };
}

export function executeWc(args: string[], cwd: string, fs: FileNode): CommandResult {
  const textArgs = args.filter(a => !a.startsWith('-'));

  if (textArgs.length === 0) {
    return { output: 'Usage: wc [options] <file or text>', lines: [makeLine('Usage: wc [options] <file or text>', 'error')], exitCode: 1 };
  }

  let text = '';
  const filePath = resolvePath(expandTilde(textArgs[0], '/home/nexus'), cwd);
  const node = getNode(filePath, fs);

  if (node && node.type === 'file' && node.content) {
    text = node.content;
  } else {
    text = textArgs.join(' ');
  }

  const lineCount = text.split('\n').length;
  const wordCount = text.split(/\s+/).filter(w => w).length;
  const charCount = text.length;

  const showLines = args.includes('-l') || (!args.some(a => a.startsWith('-')));
  const showWords = args.includes('-w') || (!args.some(a => a.startsWith('-')));
  const showChars = args.includes('-c') || args.includes('-m') || (!args.some(a => a.startsWith('-')));

  let result = '';
  if (showLines) result += `${String(lineCount).padStart(6)}`;
  if (showWords) result += `${String(wordCount).padStart(6)}`;
  if (showChars) result += `${String(charCount).padStart(6)}`;
  if (node) result += ` ${textArgs[0]}`;

  return { output: result.trim(), lines: [makeLine(result.trim())], exitCode: 0 };
}

export function executeGrep(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const caseInsensitive = args.includes('-i');
  const invert = args.includes('-v');
  const lineNumbers = args.includes('-n');
  const textArgs = args.filter(a => !a.startsWith('-'));

  if (textArgs.length < 2) {
    return { output: 'Usage: grep [options] <pattern> <text or file>', lines: [makeLine('Usage: grep [options] <pattern> <text or file>', 'error')], exitCode: 1 };
  }

  const pattern = textArgs[0];
  const flags = caseInsensitive ? 'gi' : 'g';
  let regex: RegExp;
  try {
    regex = new RegExp(`(${pattern})`, flags);
  } catch {
    return { output: `grep: invalid regex: ${pattern}`, lines: [makeLine(`grep: invalid regex: ${pattern}`, 'error')], exitCode: 1 };
  }

  const filePath = resolvePath(expandTilde(textArgs[1], '/home/nexus'), cwd);
  const node = getNode(filePath, fs);
  let text: string;

  if (node && node.type === 'file' && node.content) {
    text = node.content;
  } else {
    text = textArgs.slice(1).join(' ');
  }

  const textLines = text.split('\n');
  let matchCount = 0;

  textLines.forEach((line, idx) => {
    const matches = invert ? !regex.test(line) : regex.test(line);
    if (matches) {
      matchCount++;
      const prefix = lineNumbers ? `${idx + 1}:` : '';
      const highlighted = line.replace(regex, '<span class="text-red-400 font-bold">$1</span>');
      lines.push(makeLine(`${prefix}${highlighted}`, 'output', true));
    }
  });

  if (matchCount === 0) {
    return { output: '', lines: [], exitCode: 1 };
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeFind(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const nameIdx = args.indexOf('-name');
  let pattern = '*';

  if (nameIdx !== -1 && args[nameIdx + 1]) {
    pattern = args[nameIdx + 1];
  }

  const searchPath = args.filter(a => !a.startsWith('-') && a !== pattern)[0];

  let targetPath = cwd;
  if (searchPath && args.indexOf(searchPath) < nameIdx) {
    targetPath = resolvePath(expandTilde(searchPath, '/home/nexus'), cwd);
  }

  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

  function search(path: string, depth = 0) {
    if (depth > 20) return;
    try {
      const node = getNode(path, fs);
      if (!node || node.type !== 'directory') return;

      const entries = (node.children || []).filter(e => !e.hidden);
      for (const entry of entries) {
        const fullPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
        if (regex.test(entry.name)) {
          lines.push(makeLine(fullPath));
        }
        if (entry.type === 'directory') {
          search(fullPath, depth + 1);
        }
      }
    } catch { /* ignore */ }
  }

  search(targetPath);

  if (lines.length === 0) {
    return { output: '', lines: [], exitCode: 0 };
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeDiff(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];

  if (args.length < 2) {
    return { output: 'Usage: diff <file1> <file2>', lines: [makeLine('Usage: diff <file1> <file2>', 'error')], exitCode: 1 };
  }

  const path1 = resolvePath(expandTilde(args[0], '/home/nexus'), cwd);
  const path2 = resolvePath(expandTilde(args[1], '/home/nexus'), cwd);
  const node1 = getNode(path1, fs);
  const node2 = getNode(path2, fs);

  if (!node1 || node1.type !== 'file') {
    return { output: `diff: ${args[0]}: No such file`, lines: [makeLine(`diff: ${args[0]}: No such file`, 'error')], exitCode: 1 };
  }
  if (!node2 || node2.type !== 'file') {
    return { output: `diff: ${args[1]}: No such file`, lines: [makeLine(`diff: ${args[1]}: No such file`, 'error')], exitCode: 1 };
  }

  const lines1 = (node1.content || '').split('\n');
  const lines2 = (node2.content || '').split('\n');
  const maxLen = Math.max(lines1.length, lines2.length);

  let hasDiff = false;
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i];
    const l2 = lines2[i];
    if (l1 !== l2) {
      hasDiff = true;
      if (l1 !== undefined) lines.push(makeLine(`<span class="text-red-400">- ${l1}</span>`, 'output', true));
      if (l2 !== undefined) lines.push(makeLine(`<span class="text-green-400">+ ${l2}</span>`, 'output', true));
    }
  }

  if (!hasDiff) {
    lines.push(makeLine('Files are identical', 'success'));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: hasDiff ? 1 : 0 };
}

export function executeUniq(args: string[]): CommandResult {
  const text = args.filter(a => !a.startsWith('-')).join('\n').split('\n');
  const unique = text.filter((line, idx) => text.indexOf(line) === idx);
  return { output: unique.join('\n'), lines: unique.map(l => makeLine(l)), exitCode: 0 };
}

export function executeTr(args: string[]): CommandResult {
  const textArgs = args.filter(a => !a.startsWith('-'));

  if (textArgs.length < 2) {
    return { output: 'Usage: tr <set1> <set2> [text]', lines: [makeLine('Usage: tr <set1> <set2> [text]', 'error')], exitCode: 1 };
  }

  const set1 = textArgs[0];
  const set2 = textArgs[1];
  const text = textArgs.slice(2).join(' ');

  if (!text) {
    return { output: 'Usage: tr <set1> <set2> <text>', lines: [makeLine('Usage: tr <set1> <set2> <text>', 'error')], exitCode: 1 };
  }

  let result = '';
  for (const char of text) {
    const idx = set1.indexOf(char);
    if (idx !== -1 && idx < set2.length) {
      result += set2[idx];
    } else if (idx !== -1 && set2.length > 0) {
      result += set2[set2.length - 1];
    } else {
      result += char;
    }
  }

  return { output: result, lines: [makeLine(result)], exitCode: 0 };
}

export function executeSed(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];

  if (args.length === 0) {
    return { output: 'Usage: sed \'s/old/new/g\' <text>', lines: [makeLine('Usage: sed \'s/old/new/g\' <text>', 'error')], exitCode: 1 };
  }

  // Parse s/old/new/g pattern
  const sedPattern = args.find(a => a.startsWith('s/'));
  if (!sedPattern) {
    return { output: 'Usage: sed \'s/old/new/g\' <text>', lines: [makeLine('Usage: sed \'s/old/new/g\' <text>', 'error')], exitCode: 1 };
  }

  const parts = sedPattern.split('/');
  if (parts.length < 3) {
    return { output: 'sed: invalid expression', lines: [makeLine('sed: invalid expression', 'error')], exitCode: 1 };
  }

  const pattern = parts[1];
  const replacement = parts[2];
  const global = parts.length > 3 && parts[3] === 'g';
  const flags = global ? 'g' : '';

  const text = args.filter(a => !a.startsWith('-') && a !== sedPattern).join(' ');
  const regex = new RegExp(pattern, flags);
  const result = text.replace(regex, replacement);

  return { output: result, lines: [makeLine(result)], exitCode: 0 };
}

export function executeXargs(args: string[]): CommandResult {
  return { output: 'xargs: simulated. Would execute command with piped input.', lines: [makeLine('xargs: simulated - no pipe input available', 'warning')], exitCode: 0 };
}

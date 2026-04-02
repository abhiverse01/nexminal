import { CommandResult, FileNode, TerminalLine } from '../types';
import {
  resolvePath, getNode, createFile, createDirectory, createDirectoryRecursive,
  deleteNode, updateFile, listDirectory, formatSize, formatDate
} from '../virtualFileSystem';
import { expandTilde } from '../environment';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeCat(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const showNumbers = args.includes('-n');
  const fileArgs = args.filter(a => !a.startsWith('-'));

  if (fileArgs.length === 0) {
    return { output: 'cat: missing file operand', lines: [makeLine('cat: missing file operand', 'error')], exitCode: 1 };
  }

  for (const arg of fileArgs) {
    const path = resolvePath(expandTilde(arg, '/home/nexus'), cwd);
    const node = getNode(path, fs);

    if (!node) {
      return { output: `cat: ${arg}: No such file or directory`, lines: [makeLine(`cat: ${arg}: No such file or directory`, 'error')], exitCode: 1 };
    }

    if (node.type === 'directory') {
      return { output: `cat: ${arg}: Is a directory`, lines: [makeLine(`cat: ${arg}: Is a directory`, 'error')], exitCode: 1 };
    }

    const content = node.content || '';
    const contentLines = content.split('\n');
    
    contentLines.forEach((line, i) => {
      const num = showNumbers ? String(i + 1).padStart(6) + '  ' : '';
      lines.push(makeLine(num + line, 'output'));
    });
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeTouch(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  let newFs = fs;

  for (const arg of args) {
    if (arg.startsWith('-')) continue;
    const path = resolvePath(expandTilde(arg, '/home/nexus'), cwd);
    try {
      const existing = getNode(path, newFs);
      if (existing) {
        existing.modified = new Date().toISOString();
        lines.push(makeLine(``, 'output'));
      } else {
        newFs = createFile(path, newFs, '');
      }
    } catch (err: any) {
      return { output: `touch: ${err.message}`, lines: [makeLine(`touch: ${err.message}`, 'error')], exitCode: 1, changeCwd: undefined };
    }
  }

  return { output: '', lines, exitCode: 0 };
}

export function executeMkdir(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const parents = args.includes('-p');
  const dirs = args.filter(a => !a.startsWith('-'));

  if (dirs.length === 0) {
    return { output: 'mkdir: missing operand', lines: [makeLine('mkdir: missing operand', 'error')], exitCode: 1 };
  }

  let newFs = fs;
  for (const dir of dirs) {
    const path = resolvePath(expandTilde(dir, '/home/nexus'), cwd);
    try {
      newFs = parents ? createDirectoryRecursive(path, newFs) : createDirectory(path, newFs);
    } catch (err: any) {
      if (!parents) {
        return { output: `mkdir: ${err.message}`, lines: [makeLine(`mkdir: ${err.message}`, 'error')], exitCode: 1 };
      }
    }
  }

  return { output: '', lines, exitCode: 0 };
}

export function executeRmdir(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const dirs = args.filter(a => !a.startsWith('-'));

  if (dirs.length === 0) {
    return { output: 'rmdir: missing operand', lines: [makeLine('rmdir: missing operand', 'error')], exitCode: 1 };
  }

  let newFs = fs;
  for (const dir of dirs) {
    const path = resolvePath(expandTilde(dir, '/home/nexus'), cwd);
    try {
      const node = getNode(path, newFs);
      if (!node) {
        return { output: `rmdir: failed to remove '${dir}': No such file or directory`, lines: [makeLine(`rmdir: failed to remove '${dir}': No such file or directory`, 'error')], exitCode: 1 };
      }
      if (node.type !== 'directory') {
        return { output: `rmdir: failed to remove '${dir}': Not a directory`, lines: [makeLine(`rmdir: failed to remove '${dir}': Not a directory`, 'error')], exitCode: 1 };
      }
      if (node.children && node.children.length > 0) {
        return { output: `rmdir: failed to remove '${dir}': Directory not empty`, lines: [makeLine(`rmdir: failed to remove '${dir}': Directory not empty`, 'error')], exitCode: 1 };
      }
      newFs = deleteNode(path, newFs);
    } catch (err: any) {
      return { output: `rmdir: ${err.message}`, lines: [makeLine(`rmdir: ${err.message}`, 'error')], exitCode: 1 };
    }
  }

  return { output: '', lines, exitCode: 0 };
}

export function executeRm(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
  const force = args.includes('-f') || args.includes('-rf') || args.includes('-fr');
  const targets = args.filter(a => !a.startsWith('-'));

  if (targets.length === 0) {
    return { output: 'rm: missing operand', lines: [makeLine('rm: missing operand', 'error')], exitCode: 1 };
  }

  let newFs = fs;
  for (const target of targets) {
    const path = resolvePath(expandTilde(target, '/home/nexus'), cwd);
    try {
      const node = getNode(path, newFs);
      if (!node) {
        if (!force) {
          return { output: `rm: cannot remove '${target}': No such file or directory`, lines: [makeLine(`rm: cannot remove '${target}': No such file or directory`, 'error')], exitCode: 1 };
        }
        continue;
      }
      if (node.type === 'directory' && !recursive) {
        return { output: `rm: cannot remove '${target}': Is a directory`, lines: [makeLine(`rm: cannot remove '${target}': Is a directory`, 'error')], exitCode: 1 };
      }
      if (node.type === 'directory' && node.children && node.children.length > 0 && !recursive) {
        return { output: `rm: cannot remove '${target}': Directory not empty`, lines: [makeLine(`rm: cannot remove '${target}': Directory not empty`, 'error')], exitCode: 1 };
      }
      newFs = deleteNode(path, newFs);
    } catch (err: any) {
      if (!force) {
        return { output: `rm: ${err.message}`, lines: [makeLine(`rm: ${err.message}`, 'error')], exitCode: 1 };
      }
    }
  }

  return { output: '', lines, exitCode: 0 };
}

export function executeCp(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const recursive = args.includes('-r') || args.includes('-R');
  const cleanArgs = args.filter(a => !a.startsWith('-'));

  if (cleanArgs.length < 2) {
    return { output: 'cp: missing file operand', lines: [makeLine('cp: missing file operand', 'error')], exitCode: 1 };
  }

  const srcPath = resolvePath(expandTilde(cleanArgs[0], '/home/nexus'), cwd);
  const destPath = resolvePath(expandTilde(cleanArgs[1], '/home/nexus'), cwd);
  const srcNode = getNode(srcPath, fs);

  if (!srcNode) {
    return { output: `cp: cannot stat '${cleanArgs[0]}': No such file or directory`, lines: [makeLine(`cp: cannot stat '${cleanArgs[0]}': No such file or directory`, 'error')], exitCode: 1 };
  }

  try {
    const destNode = getNode(destPath, fs);
    if (destNode && destNode.type === 'directory') {
      const newFileName = srcPath.split('/').pop()!;
      const newFs = createFile(`${destPath}/${newFileName}`, fs, srcNode.content || '');
      return { output: '', lines, exitCode: 0 };
    }
    const newFs = createFile(destPath, fs, srcNode.content || '');
    return { output: '', lines, exitCode: 0 };
  } catch (err: any) {
    return { output: `cp: ${err.message}`, lines: [makeLine(`cp: ${err.message}`, 'error')], exitCode: 1 };
  }
}

export function executeMv(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const cleanArgs = args.filter(a => !a.startsWith('-'));

  if (cleanArgs.length < 2) {
    return { output: 'mv: missing file operand', lines: [makeLine('mv: missing file operand', 'error')], exitCode: 1 };
  }

  const srcPath = resolvePath(expandTilde(cleanArgs[0], '/home/nexus'), cwd);
  const destPath = resolvePath(expandTilde(cleanArgs[1], '/home/nexus'), cwd);
  const srcNode = getNode(srcPath, fs);

  if (!srcNode) {
    return { output: `mv: cannot stat '${cleanArgs[0]}': No such file or directory`, lines: [makeLine(`mv: cannot stat '${cleanArgs[0]}': No such file or directory`, 'error')], exitCode: 1 };
  }

  try {
    let newFs = fs;
    const destNode = getNode(destPath, newFs);
    if (destNode && destNode.type === 'directory') {
      const newFileName = srcPath.split('/').pop()!;
      const fullPath = `${destPath}/${newFileName}`;
      newFs = createFile(fullPath, newFs, srcNode.content || '');
    } else {
      newFs = createFile(destPath, newFs, srcNode.content || '');
    }
    newFs = deleteNode(srcPath, newFs);
    return { output: '', lines, exitCode: 0 };
  } catch (err: any) {
    return { output: `mv: ${err.message}`, lines: [makeLine(`mv: ${err.message}`, 'error')], exitCode: 1 };
  }
}

export function executeEcho(args: string[], flags: string[]): CommandResult {
  const noNewline = flags.includes('-n');
  const text = args.join(' ');
  const output = noNewline ? text : text + '\n';
  return { output, lines: [makeLine(output)], exitCode: 0 };
}

export function executeWrite(args: string[], cwd: string, fs: FileNode): CommandResult {
  if (args.length < 2) {
    return { output: 'Usage: write <file> <content>', lines: [makeLine('Usage: write <file> <content>', 'error')], exitCode: 1 };
  }

  const filePath = resolvePath(expandTilde(args[0], '/home/nexus'), cwd);
  const content = args.slice(1).join(' ');

  try {
    const node = getNode(filePath, fs);
    if (node && node.type === 'file') {
      const newFs = updateFile(filePath, fs, content);
      return { output: '', lines: [makeLine(`Written ${content.length} bytes to ${args[0]}`, 'success')], exitCode: 0 };
    }
    const newFs = createFile(filePath, fs, content);
    return { output: '', lines: [makeLine(`Created ${args[0]} with ${content.length} bytes`, 'success')], exitCode: 0 };
  } catch (err: any) {
    return { output: `write: ${err.message}`, lines: [makeLine(`write: ${err.message}`, 'error')], exitCode: 1 };
  }
}

export function executeHead(args: string[], cwd: string, fs: FileNode): CommandResult {
  const nIdx = args.indexOf('-n');
  let n = 10;
  const cleanArgs = args.filter(a => !a.startsWith('-'));

  if (nIdx !== -1 && args[nIdx + 1]) {
    n = parseInt(args[nIdx + 1]) || 10;
  } else if (cleanArgs.length > 1 && !isNaN(parseInt(cleanArgs[cleanArgs.length - 1]))) {
    n = parseInt(cleanArgs.pop()!) || 10;
  }

  if (cleanArgs.length === 0) {
    return { output: 'head: missing file operand', lines: [makeLine('head: missing file operand', 'error')], exitCode: 1 };
  }

  const filePath = resolvePath(expandTilde(cleanArgs[0], '/home/nexus'), cwd);
  const node = getNode(filePath, fs);

  if (!node || node.type !== 'file') {
    return { output: `head: ${cleanArgs[0]}: No such file`, lines: [makeLine(`head: ${cleanArgs[0]}: No such file`, 'error')], exitCode: 1 };
  }

  const contentLines = (node.content || '').split('\n').slice(0, n);
  return { output: contentLines.join('\n'), lines: contentLines.map(l => makeLine(l)), exitCode: 0 };
}

export function executeTail(args: string[], cwd: string, fs: FileNode): CommandResult {
  const nIdx = args.indexOf('-n');
  let n = 10;
  const cleanArgs = args.filter(a => !a.startsWith('-'));

  if (nIdx !== -1 && args[nIdx + 1]) {
    n = parseInt(args[nIdx + 1]) || 10;
  } else if (cleanArgs.length > 1 && !isNaN(parseInt(cleanArgs[cleanArgs.length - 1]))) {
    n = parseInt(cleanArgs.pop()!) || 10;
  }

  if (cleanArgs.length === 0) {
    return { output: 'tail: missing file operand', lines: [makeLine('tail: missing file operand', 'error')], exitCode: 1 };
  }

  const filePath = resolvePath(expandTilde(cleanArgs[0], '/home/nexus'), cwd);
  const node = getNode(filePath, fs);

  if (!node || node.type !== 'file') {
    return { output: `tail: ${cleanArgs[0]}: No such file`, lines: [makeLine(`tail: ${cleanArgs[0]}: No such file`, 'error')], exitCode: 1 };
  }

  const contentLines = (node.content || '').split('\n').slice(-n);
  return { output: contentLines.join('\n'), lines: contentLines.map(l => makeLine(l)), exitCode: 0 };
}

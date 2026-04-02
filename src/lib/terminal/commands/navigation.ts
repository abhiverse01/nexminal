import { CommandResult, FileNode, TerminalLine } from '../types';
import { resolvePath, listDirectory, getNode, getFileSize, formatDate } from '../virtualFileSystem';
import { expandTilde } from '../environment';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeLs(args: string[], flags: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  const long = flags.includes('-l') || flags.includes('-la') || flags.includes('-al') || flags.includes('-alh') || flags.includes('-lh');
  const all = flags.includes('-a') || flags.includes('-la') || flags.includes('-al') || flags.includes('-alh');
  const humanSize = flags.includes('-lh') || flags.includes('-alh') || flags.includes('-h');
  const recursive = flags.includes('-R');

  const targetPath = args[0] ? resolvePath(expandTilde(args[0], '/home/nexus'), cwd) : cwd;

  try {
    function renderDir(path: string, prefix = '') {
      const entries = listDirectory(path, fs);
      let displayEntries = all ? entries : entries.filter(e => !e.hidden);
      displayEntries.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      if (recursive && prefix) {
        lines.push(makeLine(`${prefix}${path}:`, 'info'));
      }

      if (long) {
        if (all) {
          lines.push(makeLine('total ' + entries.length, 'output'));
        }
        for (const entry of displayEntries) {
          const perm = entry.permissions || (entry.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
          const size = humanSize ? formatHumanSize(entry.type === 'directory' ? 4096 : entry.size) : String(entry.type === 'directory' ? 4096 : entry.size).padStart(8);
          const date = formatDate(entry.modified);
          const colorClass = entry.type === 'directory' ? 'text-blue-400' : entry.permissions?.startsWith('-rwx') ? 'text-green-400' : entry.hidden ? 'text-gray-500' : '';
          const displayName = entry.type === 'directory' ? `<span class="text-blue-400 font-bold">${entry.name}/</span>` : entry.hidden ? `<span class="text-gray-500">${entry.name}</span>` : entry.name;
          lines.push(makeLine(`<span class="text-gray-500">${perm}</span>  ${size}  ${date}  ${displayName}`, 'output', true));
        }
      } else {
        let output = '';
        for (const entry of displayEntries) {
          if (entry.type === 'directory') {
            output += `<span class="text-blue-400 font-bold">${entry.name}/</span>  `;
          } else if (entry.permissions?.startsWith('-rwx')) {
            output += `<span class="text-green-400">${entry.name}</span>  `;
          } else if (entry.hidden) {
            output += `<span class="text-gray-500">${entry.name}</span>  `;
          } else {
            output += `${entry.name}  `;
          }
        }
        if (output) lines.push(makeLine(output, 'output', true));
      }

      if (recursive) {
        for (const entry of displayEntries) {
          if (entry.type === 'directory' && entry.name !== '.' && entry.name !== '..') {
            const childPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
            lines.push(makeLine('', 'output'));
            renderDir(childPath, '');
          }
        }
      }
    }

    renderDir(targetPath);

    return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
  } catch (err: any) {
    return { output: `ls: ${err.message}`, lines: [makeLine(`ls: ${err.message}`, 'error')], exitCode: 1 };
  }
}

function formatHumanSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'K';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + 'M';
  return (bytes / 1073741824).toFixed(1) + 'G';
}

export function executeCd(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];

  if (args.length === 0 || args[0] === '~') {
    return { output: '', lines, exitCode: 0, changeCwd: '/home/nexus' };
  }

  if (args[0] === '-') {
    return { output: '', lines, exitCode: 0, changeCwd: 'PREV' };
  }

  const targetPath = resolvePath(expandTilde(args[0], '/home/nexus'), cwd);
  const node = getNode(targetPath, fs);

  if (!node) {
    return { output: `cd: no such file or directory: ${args[0]}`, lines: [makeLine(`cd: no such file or directory: ${args[0]}`, 'error')], exitCode: 1 };
  }

  if (node.type !== 'directory') {
    return { output: `cd: not a directory: ${args[0]}`, lines: [makeLine(`cd: not a directory: ${args[0]}`, 'error')], exitCode: 1 };
  }

  return { output: '', lines, exitCode: 0, changeCwd: targetPath };
}

export function executePwd(cwd: string): CommandResult {
  return { output: cwd, lines: [makeLine(cwd)], exitCode: 0 };
}

export function executeTree(args: string[], cwd: string, fs: FileNode): CommandResult {
  const lines: TerminalLine[] = [];
  let maxDepth = Infinity;

  const depthIdx = args.indexOf('-L');
  if (depthIdx !== -1 && args[depthIdx + 1]) {
    maxDepth = parseInt(args[depthIdx + 1]) || Infinity;
  }

  const targetPath = args.filter(a => !a.startsWith('-'))[0]
    ? resolvePath(expandTilde(args.filter(a => !a.startsWith('-'))[0], '/home/nexus'), cwd)
    : cwd;

  const node = getNode(targetPath, fs);
  if (!node || node.type !== 'directory') {
    return { output: `tree: not a directory: ${targetPath}`, lines: [makeLine(`tree: not a directory: ${targetPath}`, 'error')], exitCode: 1 };
  }

  let dirCount = 0;
  let fileCount = 0;

  function renderTree(path: string, prefix: string, depth: number) {
    if (depth > maxDepth) return;
    const entries = listDirectory(path, fs).filter(e => !e.hidden);
    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    entries.forEach((entry, i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const name = entry.type === 'directory'
        ? `<span class="text-blue-400 font-bold">${entry.name}</span>`
        : entry.name;
      lines.push(makeLine(prefix + connector + name, 'output', true));

      if (entry.type === 'directory') {
        dirCount++;
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        const childPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
        renderTree(childPath, newPrefix, depth + 1);
      } else {
        fileCount++;
      }
    });
  }

  lines.push(makeLine(`<span class="text-blue-400 font-bold">${targetPath === cwd ? '.' : targetPath}</span>`, 'output', true));
  dirCount++;
  renderTree(targetPath, '', 0);
  lines.push(makeLine(`\n${dirCount} directories, ${fileCount} files`, 'info'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

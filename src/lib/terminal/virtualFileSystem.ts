import { FileNode } from './types';

const now = new Date().toISOString();
const pastDate = new Date(Date.now() - 86400000 * 30).toISOString();

function file(name: string, content: string, permissions = '-rw-r--r--', size?: number, hidden = false): FileNode {
  return {
    name, type: 'file', content, permissions,
    size: size ?? new Blob([content]).size,
    created: pastDate, modified: now, hidden,
  };
}

function dir(name: string, children: FileNode[], permissions = 'drwxr-xr-x', hidden = false): FileNode {
  return {
    name, type: 'directory', children, permissions,
    size: children.length * 4096, created: pastDate, modified: now, hidden,
  };
}

export function initFileSystem(): FileNode {
  return dir('/', [
    dir('home', [
      dir('nexus', [
        dir('Documents', [
          file('readme.txt', '# Welcome to NEXUS Terminal\n\nThis is a browser-based terminal emulator built with Next.js.\n\n## Features\n- 30+ commands\n- Virtual file system\n- Multiple themes\n- Built-in games\n- And much more!\n\nType `help` to see all available commands.'),
          file('todo.md', '# My Todo List\n\n- [x] Build NEXUS Terminal\n- [x] Add virtual file system\n- [x] Implement games\n- [ ] Take over the world\n- [ ] Get coffee'),
          file('notes.txt', 'Meeting Notes - 2024\n====================\n\n1. Discussed project architecture\n2. Reviewed terminal command specs\n3. Agreed on theme system design\n4. Next meeting: TBD'),
          file('projects.csv', 'name,language,status,priority\nnexus-terminal,TypeScript,Active,High\nweb-scraper,Python,Completed,Medium\ndata-pipeline,Go,In Progress,High\nmobile-app,Kotlin,Planned,Low'),
        ]),
        dir('Projects', [
          dir('nexus-terminal', [
            file('package.json', '{\n  "name": "nexus-terminal",\n  "version": "2.0.0",\n  "description": "A browser-based terminal emulator",\n  "main": "index.ts",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "16.0.0",\n    "react": "^19.0.0"\n  }\n}'),
            file('README.md', '# NEXUS Terminal\n\nA feature-rich browser-based terminal emulator.\n\n## Installation\n```bash\nnpm install\nnpm run dev\n```\n\n## Features\n- Virtual File System\n- 30+ Commands\n- 4 Built-in Games\n- 9 Color Themes'),
            dir('src', [
              file('index.ts', 'import { Terminal } from "./terminal";\n\nconst term = new Terminal();\nterm.init();'),
              dir('terminal', [
                file('index.ts', '// Terminal engine\nexport class Terminal {\n  init() {\n    console.log("NEXUS Terminal initialized");\n  }\n}'),
              ]),
            ]),
          ]),
          dir('portfolio', [
            file('index.html', '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title></head>\n<body>\n  <h1>Welcome to my portfolio</h1>\n  <p>Built with love and coffee.</p>\n</body>\n</html>'),
            file('style.css', 'body {\n  font-family: monospace;\n  background: #282a36;\n  color: #f8f8f2;\n  margin: 0;\n  padding: 2rem;\n}'),
          ]),
        ]),
        dir('Downloads', [
          file('archive.tar.gz', '[Binary file - 2.4 MB]'),
          file('photo.jpg', '[Binary file - 1.8 MB]'),
          file('document.pdf', '[Binary file - 456 KB]'),
        ]),
        dir('.config', [
          dir('nexus', [
            file('config.json', '{\n  "theme": "dracula",\n  "fontSize": 14,\n  "cursorStyle": "block",\n  "scrollback": 10000,\n  "bellStyle": "none",\n  "shell": "/bin/nexus-sh"\n}'),
            file('keybindings.json', '{\n  "copy": "Ctrl+Shift+C",\n  "paste": "Ctrl+Shift+V",\n  "clear": "Ctrl+L",\n  "newTab": "Ctrl+Shift+T"\n}'),
          ]),
          dir('git', [
            file('config', '[user]\n    name = Abhishek Shah\n    email = abhishek@nexus.dev\n[core]\n    editor = nano\n    autocrlf = input\n[pull]\n    rebase = false\n[push]\n    autoSetupRemote = true'),
          ]),
          file('.bashrc', '# NEXUS Terminal Configuration\nexport NEXUS_THEME=dracula\nexport EDITOR=nano\nalias ll="ls -la"\nalias cls="clear"\nalias ..="cd .."\n\nPS1="\\u@nexus:\\w$ "'),
        ], 'drwxr-xr-x', true),
        dir('.ssh', [
          file('known_hosts', 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAA...\ngitlab.com ssh-ed25519 AAAAC3NzaC1lZDI1...'),
        ], 'drwx------', true),
        file('.gitconfig', '[user]\n    name = Abhishek Shah\n    email = abhishek@nexus.dev\n[color]\n    ui = auto\n[alias]\n    st = status\n    co = checkout\n    br = branch', '-rw-r--r--', undefined, true),
        file('.profile', '# ~/.profile\nexport PATH="$HOME/.local/bin:$PATH"\nexport EDITOR=nano', '-rw-r--r--', undefined, true),
      ]),
    ]),
    dir('etc', [
      file('hostname', 'nexus'),
      file('hosts', '127.0.0.1  localhost\n127.0.1.1  nexus\n::1        localhost ip6-localhost'),
      file('passwd', 'root:x:0:0:root:/root:/bin/bash\nnexus:x:1000:1000:NEXUS User:/home/nexus:/bin/nexus-sh\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin'),
      file('shadow', 'root:!:19000:0:99999:7:::\nnexus:$6$rounds=...:19000:0:99999:7:::', '-rw-r-----'),
      file('os-release', 'NAME="NEXUS OS"\nVERSION="2.0.0"\nID=nexus\nPRETTY_NAME="NEXUS OS 2.0.0"\nHOME_URL="https://nexus.dev"'),
      file('resolv.conf', 'nameserver 8.8.8.8\nnameserver 8.8.4.4\nsearch nexus.dev'),
      file('fstab', '# /etc/fstab: static file system information\n# <file system>  <mount point>  <type>  <options>  <dump>  <pass>\n/dev/sda1        /              ext4    defaults   0       1\n/dev/sda2        /home          ext4    defaults   0       2'),
      file('motd', 'Welcome to NEXUS Terminal v2.0.0\nType "help" for a list of available commands.'),
      dir('nginx', [
        file('nginx.conf', 'worker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n  server {\n    listen 80;\n    server_name localhost;\n    location / {\n      root /var/www/html;\n      index index.html;\n    }\n  }\n}'),
      ]),
    ]),
    dir('var', [
      dir('log', [
        file('syslog', `${pastDate} nexus systemd[1]: Started NEXUS Terminal.\n${now} nexus kernel: All systems operational.`),
        file('auth.log', `${pastDate} nexus sshd[1234]: Accepted publickey for nexus`),
        file('nexus.log', `${pastDate} [INFO] NEXUS Terminal v2.0.0 initialized\n${now} [INFO] Session started`),
      ]),
      dir('www', [
        dir('html', [
          file('index.html', '<!DOCTYPE html>\n<html><head><title>NEXUS</title></head>\n<body><h1>It works!</h1></body></html>'),
        ]),
      ]),
      dir('tmp', []),
    ]),
    dir('tmp', [
      file('.nexus-session', 'session-id: abc123\nstarted: ' + now, '-rw-------', undefined, true),
    ]),
    dir('usr', [
      dir('bin', [
        file('nexus-sh', '#!/bin/nexus-sh\n# NEXUS Shell v2.0\nwhile true; do\n  read -p "$PS1" cmd\n  eval "$cmd"\ndone', '-rwxr-xr-x'),
      ]),
      dir('local', [
        dir('bin', []),
      ]),
      dir('share', [
        dir('doc', []),
      ]),
    ]),
    dir('bin', []),
    dir('root', [], 'drwx------'),
    dir('dev', [
      file('null', '', 'crw-rw-rw-'),
      file('zero', '', 'crw-rw-rw-'),
      file('random', '', 'crw-rw-rw-'),
      file('tty', '', 'crw-rw-rw-'),
    ]),
    dir('proc', [
      file('cpuinfo', 'processor\t: 0\nmodel name\t: NEXUS Virtual CPU @ 3.60GHz\ncpu MHz\t\t: 3600.000\ncache size\t: 8192 KB'),
      file('meminfo', 'MemTotal:       16777216 kB\nMemFree:         8388608 kB\nMemAvailable:   12582912 kB\nBuffers:          524288 kB\nCached:          2097152 kB'),
      file('version', 'NEXUS OS version 2.0.0 (gcc version 12.2.0)'),
      file('uptime', '86400.00 172800.00'),
    ]),
  ]);
}

export function resolvePath(path: string, cwd: string, homeDir = '/home/nexus'): string {
  let resolved = path;
  
  // Expand tilde
  if (resolved === '~') return homeDir;
  if (resolved.startsWith('~/')) resolved = homeDir + resolved.slice(1);
  
  // Handle absolute vs relative
  if (!resolved.startsWith('/')) {
    resolved = cwd + '/' + resolved;
  }
  
  // Normalize path
  const parts = resolved.split('/').filter(p => p !== '' && p !== '.');
  const normalized: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      if (normalized.length > 0) normalized.pop();
    } else {
      normalized.push(part);
    }
  }
  
  return '/' + normalized.join('/');
}

export function getNode(path: string, root: FileNode): FileNode | null {
  if (path === '/') return root;
  
  const parts = path.split('/').filter(p => p !== '');
  let current: FileNode | null = root;
  
  for (const part of parts) {
    if (!current || current.type !== 'directory' || !current.children) return null;
    current = current.children.find(c => c.name === part) || null;
  }
  
  return current;
}

export function createFile(path: string, root: FileNode, content = ''): FileNode {
  const newRoot = JSON.parse(JSON.stringify(root)) as FileNode;
  const parts = path.split('/').filter(p => p !== '');
  const fileName = parts.pop()!;
  const dirPath = '/' + parts.join('/');
  
  const parentDir = getNode(dirPath, newRoot);
  if (!parentDir || parentDir.type !== 'directory') {
    throw new Error(`No such directory: ${dirPath}`);
  }
  
  if (parentDir.children!.find(c => c.name === fileName)) {
    throw new Error(`File already exists: ${path}`);
  }
  
  parentDir.children!.push(file(fileName, content));
  return newRoot;
}

export function createDirectory(path: string, root: FileNode): FileNode {
  const newRoot = JSON.parse(JSON.stringify(root)) as FileNode;
  const parts = path.split('/').filter(p => p !== '');
  const dirName = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  
  const parentDir = getNode(parentPath, newRoot);
  if (!parentDir || parentDir.type !== 'directory') {
    throw new Error(`No such directory: ${parentPath}`);
  }
  
  if (parentDir.children!.find(c => c.name === dirName)) {
    throw new Error(`Directory already exists: ${path}`);
  }
  
  parentDir.children!.push(dir(dirName, []));
  return newRoot;
}

export function createDirectoryRecursive(path: string, root: FileNode): FileNode {
  let newRoot = JSON.parse(JSON.stringify(root)) as FileNode;
  const parts = path.split('/').filter(p => p !== '');
  let currentPath = '';
  
  for (const part of parts) {
    currentPath += '/' + part;
    const existing = getNode(currentPath, newRoot);
    if (!existing) {
      newRoot = createDirectory(currentPath, newRoot);
    } else if (existing.type !== 'directory') {
      throw new Error(`Not a directory: ${currentPath}`);
    }
  }
  
  return newRoot;
}

export function deleteNode(path: string, root: FileNode): FileNode {
  if (path === '/') throw new Error('Cannot delete root directory');
  
  const newRoot = JSON.parse(JSON.stringify(root)) as FileNode;
  const parts = path.split('/').filter(p => p !== '');
  const targetName = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  
  const parentDir = getNode(parentPath, newRoot);
  if (!parentDir || parentDir.type !== 'directory') {
    throw new Error(`No such directory: ${parentPath}`);
  }
  
  const idx = parentDir.children!.findIndex(c => c.name === targetName);
  if (idx === -1) throw new Error(`No such file or directory: ${path}`);
  
  parentDir.children!.splice(idx, 1);
  return newRoot;
}

export function updateFile(path: string, root: FileNode, content: string): FileNode {
  const newRoot = JSON.parse(JSON.stringify(root)) as FileNode;
  const node = getNode(path, newRoot);
  
  if (!node) throw new Error(`No such file: ${path}`);
  if (node.type !== 'file') throw new Error(`Not a file: ${path}`);
  
  node.content = content;
  node.size = new Blob([content]).size;
  node.modified = new Date().toISOString();
  
  return newRoot;
}

export function listDirectory(path: string, root: FileNode): FileNode[] {
  const node = getNode(path, root);
  if (!node) throw new Error(`No such directory: ${path}`);
  if (node.type !== 'directory') throw new Error(`Not a directory: ${path}`);
  return node.children || [];
}

export function getFileSize(node: FileNode): number {
  if (node.type === 'file') return node.size;
  if (node.type === 'directory' && node.children) {
    return 4096 + node.children.reduce((sum, child) => sum + getFileSize(child), 0);
  }
  return 4096;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

export function formatDate(date: string): string {
  try {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return date;
  }
}

export function findFiles(root: FileNode, basePath = '/', pattern = '*', results: FileNode[] = []): FileNode[] {
  const children = root.children || [];
  for (const child of children) {
    const fullPath = basePath === '/' ? `/${child.name}` : `${basePath}/${child.name}`;
    if (matchesPattern(child.name, pattern)) {
      results.push({ ...child, name: fullPath } as FileNode);
    }
    if (child.type === 'directory') {
      findFiles(child, fullPath, pattern, results);
    }
  }
  return results;
}

function matchesPattern(name: string, pattern: string): boolean {
  if (pattern === '*') return true;
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  return regex.test(name);
}

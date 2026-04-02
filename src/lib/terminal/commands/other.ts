import { CommandResult, TerminalLine, Theme, FileNode, GameState, TodoItem, NoteItem } from '../types';
import { nexusLogo } from '../asciiArt';
import { getThemeNames, getTheme } from '../themes';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executeHelp(): CommandResult {
  const lines: TerminalLine[] = [];

  const categories = [
    {
      name: '📂 Navigation',
      color: 'text-blue-400',
      commands: [
        { name: 'ls', desc: 'List directory contents' },
        { name: 'cd', desc: 'Change directory' },
        { name: 'pwd', desc: 'Print working directory' },
        { name: 'tree', desc: 'Show directory tree' },
      ],
    },
    {
      name: '📄 File Operations',
      color: 'text-green-400',
      commands: [
        { name: 'cat', desc: 'Display file contents' },
        { name: 'touch', desc: 'Create empty file' },
        { name: 'mkdir', desc: 'Create directory' },
        { name: 'rm', desc: 'Remove file/directory' },
        { name: 'cp', desc: 'Copy file' },
        { name: 'mv', desc: 'Move/rename file' },
        { name: 'echo', desc: 'Print text' },
        { name: 'write', desc: 'Write content to file' },
        { name: 'head/tail', desc: 'Show first/last lines' },
      ],
    },
    {
      name: '🖥️  System',
      color: 'text-yellow-400',
      commands: [
        { name: 'whoami', desc: 'Show current user' },
        { name: 'hostname', desc: 'Show hostname' },
        { name: 'uname', desc: 'System information' },
        { name: 'date', desc: 'Show date/time' },
        { name: 'uptime', desc: 'System uptime' },
        { name: 'clear', desc: 'Clear terminal' },
        { name: 'history', desc: 'Command history' },
        { name: 'neofetch', desc: 'System info display' },
        { name: 'top/htop', desc: 'Process monitor' },
        { name: 'ps', desc: 'Process list' },
      ],
    },
    {
      name: '🌐 Network (Simulated)',
      color: 'text-cyan-400',
      commands: [
        { name: 'ping', desc: 'Ping a host' },
        { name: 'curl', desc: 'HTTP request' },
        { name: 'ifconfig/ip', desc: 'Network interfaces' },
        { name: 'traceroute', desc: 'Trace route to host' },
      ],
    },
    {
      name: '🔧 Utilities',
      color: 'text-magenta-400',
      commands: [
        { name: 'calc/bc', desc: 'Math calculator' },
        { name: 'base64', desc: 'Encode/decode base64' },
        { name: 'grep', desc: 'Search with regex' },
        { name: 'find', desc: 'Find files' },
        { name: 'sort/wc', desc: 'Sort/count text' },
        { name: 'md5/sha256', desc: 'Hash text' },
      ],
    },
    {
      name: '🎮 Fun & Games',
      color: 'text-red-400',
      commands: [
        { name: 'cowsay', desc: 'ASCII cow says text' },
        { name: 'fortune', desc: 'Random fortune' },
        { name: 'matrix', desc: 'Matrix rain effect' },
        { name: 'figlet', desc: 'Big ASCII text' },
        { name: 'color/lolcat', desc: 'Rainbow text' },
        { name: 'games', desc: 'Show game menu' },
        { name: 'play', desc: 'Launch a game' },
        { name: 'score', desc: 'High scores' },
      ],
    },
    {
      name: '👤 Developer',
      color: 'text-pink-400',
      commands: [
        { name: 'about', desc: 'Developer info card' },
        { name: 'contact', desc: 'Contact information' },
        { name: 'resume', desc: 'ASCII resume' },
        { name: 'social', desc: 'Social links' },
      ],
    },
    {
      name: '⚙️  Other',
      color: 'text-orange-400',
      commands: [
        { name: 'help', desc: 'This help page' },
        { name: 'man', desc: 'Manual page' },
        { name: 'theme', desc: 'Change terminal theme' },
        { name: 'weather', desc: 'Simulated weather' },
        { name: 'todo', desc: 'Todo list manager' },
        { name: 'notes', desc: 'Quick notes' },
        { name: 'nano', desc: 'Text editor' },
        { name: 'alias', desc: 'Command aliases' },
        { name: 'env/export', desc: 'Environment variables' },
        { name: 'which/whatis', desc: 'Command info' },
        { name: 'df/free', desc: 'Disk/memory usage' },
        { name: 'cal', desc: 'Calendar' },
        { name: 'password', desc: 'Generate password' },
        { name: 'uuid', desc: 'Generate UUID' },
        { name: 'lorem', desc: 'Lorem ipsum text' },
        { name: 'logo', desc: 'Show NEXUS logo' },
      ],
    },
  ];

  lines.push(makeLine(`<span class="text-cyan-400 font-bold">╔══════════════════════════════════════════════╗</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-cyan-400 font-bold">║         NEXUS TERMINAL - COMMAND HELP         ║</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-cyan-400 font-bold">╚══════════════════════════════════════════════╝</span>`, 'output', true));
  lines.push(makeLine('', 'output'));

  for (const cat of categories) {
    lines.push(makeLine(`<span class="${cat.color} font-bold">${cat.name}</span>`, 'output', true));
    for (const cmd of cat.commands) {
      lines.push(makeLine(`  <span class="text-yellow-400">${cmd.name.padEnd(14)}</span> ${cmd.desc}`, 'output', true));
    }
    lines.push(makeLine('', 'output'));
  }

  lines.push(makeLine(`<span class="text-gray-400">Tip: Use <span class="text-yellow-400">man &lt;command&gt;</span> for detailed help on any command.</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-gray-400">Tip: Use <span class="text-yellow-400">Tab</span> for autocomplete and <span class="text-yellow-400">↑/↓</span> for history.</span>`, 'output', true));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeMan(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: 'What manual page do you want?\nUsage: man <command>', lines: [makeLine('What manual page do you want?\nUsage: man <command>', 'error')], exitCode: 1 };
  }

  const command = args[0].toLowerCase();
  const manualPages: Record<string, string> = {
    ls: `LS(1)\n\nNAME\n    ls - list directory contents\n\nSYNOPSIS\n    ls [OPTION]... [FILE]...\n\nDESCRIPTION\n    List information about the FILEs (the current directory by default).\n\n    -l     use a long listing format\n    -a     do not ignore entries starting with .\n    -R     list subdirectories recursively`,
    cd: `CD(1)\n\nNAME\n    cd - change the working directory\n\nSYNOPSIS\n    cd [dir]\n\nDESCRIPTION\n    Change the current directory to dir. The default dir is HOME.\n\n    ~      go to home directory\n    ..     go to parent directory\n    -      go to previous directory`,
    cat: `CAT(1)\n\nNAME\n    cat - concatenate files and print\n\nSYNOPSIS\n    cat [FILE]...\n\nDESCRIPTION\n    Concatenate FILE(s) to standard output.\n\n    -n     number all output lines`,
    grep: `GREP(1)\n\nNAME\n    grep - search for patterns\n\nSYNOPSIS\n    grep [OPTIONS] PATTERN [FILE]\n\nDESCRIPTION\n    Search for PATTERN in FILE.\n\n    -i     ignore case\n    -n     print line numbers\n    -v     invert match`,
    ping: `PING(1)\n\nNAME\n    ping - send ICMP echo requests\n\nSYNOPSIS\n    ping [OPTIONS] host\n\nDESCRIPTION\n    Send ICMP ECHO_REQUEST to network hosts.\n\n    -c count   stop after count replies`,
    calc: `CALC(1)\n\nNAME\n    calc - calculator\n\nSYNOPSIS\n    calc <expression>\n\nDESCRIPTION\n    Evaluate a mathematical expression.\n    Supports: +, -, *, /, ^, %, parentheses\n\nEXAMPLE\n    calc 2 + 3 * 4\n    calc (10 + 5) / 3`,
    cowsay: `COWSAY(1)\n\nNAME\n    cowsay - cows are just mooving through\n\nSYNOPSIS\n    cowsay [-f animal] [message]\n\nDESCRIPTION\n    Configurable speaking cow.\n\n    -f animal   Choose animal: cow, tux, dragon, turtle,\n                ghost, cat, owl, stegosaurus, elephant`,
    theme: `THEME(1)\n\nNAME\n    theme - change terminal color theme\n\nSYNOPSIS\n    theme [name | list]\n\nDESCRIPTION\n    Change the terminal color theme.\n\n    theme list   Show available themes\n    theme dracula  Apply Dracula theme\n\nTHEMES\n    dracula, one-dark, monokai, solarized-dark,\n    nord, tokyo-night, catppuccin, matrix, gruvbox`,
  };

  const page = manualPages[command];
  if (!page) {
    return { output: `No manual entry for ${command}`, lines: [makeLine(`No manual entry for ${command}`, 'error')], exitCode: 1 };
  }

  return { output: page, lines: page.split('\n').map(l => makeLine(l)), exitCode: 0 };
}

export function executeTheme(args: string[], currentTheme: string): CommandResult {
  const lines: TerminalLine[] = [];
  const themeName = args.filter(a => !a.startsWith('-'))[0];

  if (!themeName || themeName === 'list') {
    const names = getThemeNames();
    lines.push(makeLine('<span class="text-cyan-400 font-bold">Available Themes:</span>', 'output', true));
    for (const name of names) {
      const isActive = name.toLowerCase() === currentTheme.toLowerCase();
      const marker = isActive ? ' <span class="text-green-400">●</span>' : ' <span class="text-gray-600">○</span>';
      lines.push(makeLine(`  ${marker} ${name}`, 'output', true));
    }
    return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
  }

  const theme = getTheme(themeName);
  if (!theme) {
    return { output: `Theme not found: ${themeName}. Use 'theme list' to see options.`, lines: [makeLine(`Theme not found: ${themeName}`, 'error')], exitCode: 1 };
  }

  return { output: `Theme changed to ${theme.name}`, lines: [makeLine(`<span class="text-green-400">Theme changed to ${theme.name} ✓</span>`, 'success', true)], exitCode: 0 };
}

export function executeWeather(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  const city = args.filter(a => !a.startsWith('-'))[0] || 'San Francisco';

  const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Clear', 'Windy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.floor(Math.random() * 30) + 5;
  const humidity = Math.floor(Math.random() * 60) + 30;
  const wind = Math.floor(Math.random() * 30) + 5;

  const weatherIcons: Record<string, string> = {
    'Sunny': '☀️ ',
    'Cloudy': '☁️ ',
    'Partly Cloudy': '⛅ ',
    'Rainy': '🌧️ ',
    'Clear': '🌙 ',
    'Windy': '💨 ',
  };

  lines.push(makeLine(`<span class="text-cyan-400 font-bold">${weatherIcons[condition] || '🌡️ '}${city} Weather</span>`, 'output', true));
  lines.push(makeLine('─────────────────────────────', 'output'));
  lines.push(makeLine(`  Condition: <span class="text-yellow-400">${condition}</span>`, 'output', true));
  lines.push(makeLine(`  Temperature: <span class="text-red-400">${temp}°C</span>`, 'output', true));
  lines.push(makeLine(`  Humidity: ${humidity}%`, 'output', true));
  lines.push(makeLine(`  Wind: ${wind} km/h`, 'output', true));
  lines.push(makeLine('─────────────────────────────', 'output'));
  lines.push(makeLine('  Simulated weather data', 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeTodo(args: string[], todos: TodoItem[]): CommandResult {
  const lines: TerminalLine[] = [];
  const action = args[0];
  let newTodos = [...todos];

  switch (action) {
    case 'add': {
      const text = args.slice(1).join(' ');
      if (!text) return { output: 'Usage: todo add <text>', lines: [makeLine('Usage: todo add <text>', 'error')], exitCode: 1 };
      const item: TodoItem = { id: Date.now().toString(), text, completed: false, createdAt: new Date().toISOString() };
      newTodos.push(item);
      lines.push(makeLine(`<span class="text-green-400">✓ Added: ${text}</span>`, 'success', true));
      break;
    }
    case 'done': {
      const idx = parseInt(args[1]) - 1;
      if (isNaN(idx) || idx < 0 || idx >= newTodos.length) {
        return { output: 'Invalid todo index', lines: [makeLine('Invalid todo index', 'error')], exitCode: 1 };
      }
      newTodos[idx].completed = true;
      lines.push(makeLine(`<span class="text-green-400">✓ Completed: ${newTodos[idx].text}</span>`, 'success', true));
      break;
    }
    case 'remove': {
      const idx = parseInt(args[1]) - 1;
      if (isNaN(idx) || idx < 0 || idx >= newTodos.length) {
        return { output: 'Invalid todo index', lines: [makeLine('Invalid todo index', 'error')], exitCode: 1 };
      }
      const removed = newTodos.splice(idx, 1);
      lines.push(makeLine(`<span class="text-red-400">✗ Removed: ${removed[0].text}</span>`, 'warning', true));
      break;
    }
    case 'clear': {
      newTodos = [];
      lines.push(makeLine('<span class="text-yellow-400">All todos cleared</span>', 'warning', true));
      break;
    }
    default: {
      if (newTodos.length === 0) {
        lines.push(makeLine('<span class="text-gray-400">No todos. Use: todo add &lt;text&gt;</span>', 'info', true));
      } else {
        lines.push(makeLine('<span class="text-cyan-400 font-bold">📋 Todo List:</span>', 'output', true));
        for (let i = 0; i < newTodos.length; i++) {
          const item = newTodos[i];
          const marker = item.completed ? '✅' : '⬜';
          const textStyle = item.completed ? 'line-through text-gray-500' : 'text-white';
          lines.push(makeLine(`  ${marker} <span class="text-gray-400">${i + 1}.</span> <span class="${textStyle}">${item.text}</span>`, 'output', true));
        }
      }
    }
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeNotes(args: string[], notes: NoteItem[]): CommandResult {
  const lines: TerminalLine[] = [];
  const action = args[0];
  let newNotes = [...notes];

  switch (action) {
    case 'new': {
      const title = args.slice(1).join(' ');
      if (!title) return { output: 'Usage: notes new <title>', lines: [makeLine('Usage: notes new <title>', 'error')], exitCode: 1 };
      const item: NoteItem = { id: Date.now().toString(), title, content: '', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() };
      newNotes.push(item);
      lines.push(makeLine(`<span class="text-green-400">✓ Created note: ${title}</span>`, 'success', true));
      break;
    }
    case 'view': {
      const idx = parseInt(args[1]) - 1;
      if (isNaN(idx) || idx < 0 || idx >= newNotes.length) {
        return { output: 'Invalid note index', lines: [makeLine('Invalid note index', 'error')], exitCode: 1 };
      }
      const note = newNotes[idx];
      lines.push(makeLine(`<span class="text-cyan-400 font-bold">📝 ${note.title}</span>`, 'output', true));
      lines.push(makeLine(`<span class="text-gray-500">Created: ${note.createdAt}</span>`, 'output', true));
      lines.push(makeLine(note.content || '(empty)', 'output'));
      break;
    }
    case 'delete': {
      const idx = parseInt(args[1]) - 1;
      if (isNaN(idx) || idx < 0 || idx >= newNotes.length) {
        return { output: 'Invalid note index', lines: [makeLine('Invalid note index', 'error')], exitCode: 1 };
      }
      const removed = newNotes.splice(idx, 1);
      lines.push(makeLine(`<span class="text-red-400">✗ Deleted: ${removed[0].title}</span>`, 'warning', true));
      break;
    }
    default: {
      if (newNotes.length === 0) {
        lines.push(makeLine('<span class="text-gray-400">No notes. Use: notes new &lt;title&gt;</span>', 'info', true));
      } else {
        lines.push(makeLine('<span class="text-cyan-400 font-bold">📒 Notes:</span>', 'output', true));
        for (let i = 0; i < newNotes.length; i++) {
          lines.push(makeLine(`  <span class="text-gray-400">${i + 1}.</span> ${newNotes[i].title}`, 'output', true));
        }
      }
    }
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeNano(args: string[], cwd: string, fs: FileNode): CommandResult {
  if (args.length === 0) {
    return { output: 'Usage: nano <file>', lines: [makeLine('Usage: nano <file>', 'error')], exitCode: 1 };
  }

  return {
    output: '',
    lines: [],
    exitCode: 0,
    gameState: {
      type: 'nano',
      data: { file: args[0], cwd },
    },
    gameMode: 'nano',
  };
}

export function executeAlias(args: string[], aliases: Record<string, string>): CommandResult {
  const lines: TerminalLine[] = [];

  if (args.length === 0) {
    const entries = Object.entries(aliases);
    if (entries.length === 0) {
      lines.push(makeLine('<span class="text-gray-400">No aliases defined. Use: alias name=command</span>', 'info', true));
    } else {
      lines.push(makeLine('<span class="text-cyan-400 font-bold">Defined Aliases:</span>', 'output', true));
      for (const [name, value] of entries) {
        lines.push(makeLine(`  <span class="text-yellow-400">alias ${name}</span>=\'${value}\'`, 'output', true));
      }
    }
    return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
  }

  const aliasDef = args.join(' ');
  const eqIdx = aliasDef.indexOf('=');
  if (eqIdx === -1) {
    // Show specific alias
    if (aliases[aliasDef]) {
      return { output: `alias ${aliasDef}='${aliases[aliasDef]}'`, lines: [makeLine(`alias ${aliasDef}='${aliases[aliasDef]}'`)], exitCode: 0 };
    }
    return { output: `alias: ${aliasDef}: not found`, lines: [makeLine(`alias: ${aliasDef}: not found`, 'error')], exitCode: 1 };
  }

  const name = aliasDef.slice(0, eqIdx).trim();
  const value = aliasDef.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');

  return {
    output: `alias ${name}='${value}'`,
    lines: [makeLine(`<span class="text-green-400">alias ${name}='${value}'</span>`, 'success', true)],
    exitCode: 0,
    setAlias: { name, value },
  };
}

export function executeExport(args: string[], env: Record<string, string>): CommandResult {
  if (args.length === 0) {
    return executeEnv(env);
  }

  const assignment = args.join(' ');
  const eqIdx = assignment.indexOf('=');
  if (eqIdx === -1) {
    const val = env[assignment];
    if (val) {
      return { output: `declare -x ${assignment}="${val}"`, lines: [makeLine(`declare -x ${assignment}="${val}"`)], exitCode: 0 };
    }
    return { output: `export: ${assignment}: not found`, lines: [makeLine(`export: ${assignment}: not found`, 'error')], exitCode: 1 };
  }

  const name = assignment.slice(0, eqIdx).trim();
  const value = assignment.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
  return {
    output: '',
    lines: [makeLine('', 'output')],
    exitCode: 0,
    gameState: { type: 'export', data: { key: name, value } },
  };
}

export function executeEnv(env: Record<string, string>): CommandResult {
  const lines: TerminalLine[] = [];
  for (const [key, value] of Object.entries(env).sort()) {
    lines.push(makeLine(`<span class="text-cyan-400">${key}</span>=<span class="text-yellow-400">${value}</span>`, 'output', true));
  }
  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeWhich(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: 'Usage: which <command>', lines: [makeLine('Usage: which <command>', 'error')], exitCode: 1 };
  }

  return { output: `/usr/bin/${args[0]}`, lines: [makeLine(`/usr/bin/${args[0]}`)], exitCode: 0 };
}

export function executeWhatis(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: 'Usage: whatis <command>', lines: [makeLine('Usage: whatis <command>', 'error')], exitCode: 1 };
  }

  const descriptions: Record<string, string> = {
    ls: 'ls - list directory contents',
    cd: 'cd - change the shell working directory',
    pwd: 'pwd - print name of current/working directory',
    cat: 'cat - concatenate files and print on the standard output',
    mkdir: 'mkdir - make directories',
    rm: 'rm - remove files or directories',
    cp: 'cp - copy files and directories',
    mv: 'mv - move (rename) files',
    echo: 'echo - display a line of text',
    grep: 'grep - search for patterns in text',
    find: 'find - search for files in a directory hierarchy',
    calc: 'calc - evaluate mathematical expressions',
    ping: 'ping - send ICMP ECHO_REQUEST to network hosts',
    curl: 'curl - transfer a URL (simulated)',
    cowsay: 'cowsay - let a cow say something',
    fortune: 'fortune - print a random, hopefully interesting, adage',
    neofetch: 'neofetch - display system information',
    help: 'help - show available commands',
    man: 'man - an interface to the on-line reference manuals',
  };

  const desc = descriptions[args[0]];
  if (!desc) {
    return { output: `${args[0]}: unknown command`, lines: [makeLine(`${args[0]}: unknown command`, 'error')], exitCode: 1 };
  }

  return { output: desc, lines: [makeLine(desc)], exitCode: 0 };
}

export function executeDf(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine('Filesystem      Size  Used Avail Use% Mounted on', 'output'));
  lines.push(makeLine('/dev/sda1        50G   18G   30G  38% /', 'output'));
  lines.push(makeLine('/dev/sda2       200G   85G  105G  45% /home', 'output'));
  lines.push(makeLine('tmpfs            8G  128M  7.9G   2% /tmp', 'output'));
  lines.push(makeLine('/dev/sda3       100G   45G   50G  48% /var', 'output'));
  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeFree(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine('              total        used        free      shared  buff/cache   available', 'output'));
  lines.push(makeLine('Mem:       16384000     4194304     8388608      524288     3801088    12288000', 'output'));
  lines.push(makeLine('Swap:       8192000           0     8192000', 'output'));
  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeCal(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  lines.push(makeLine(`<span class="text-cyan-400 font-bold">    ${months[month]} ${year}</span>`, 'output', true));
  lines.push(makeLine('Su Mo Tu We Th Fr Sa', 'output'));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  let line = '   '.repeat(firstDay);
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2);
    if (day === today) {
      line += `<span class="text-red-400 font-bold bg-red-400/20 rounded">[${dayStr}]</span> `;
    } else {
      line += `${dayStr} `;
    }
    if ((day + firstDay) % 7 === 0) {
      lines.push(makeLine(line, 'output', true));
      line = '';
    }
  }
  if (line) lines.push(makeLine(line, 'output', true));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeStopwatch(): CommandResult {
  return {
    output: '',
    lines: [],
    exitCode: 0,
    gameState: { type: 'stopwatch', data: { startTime: Date.now(), running: true } },
    gameMode: 'stopwatch',
  };
}

export function executeTimer(args: string[]): CommandResult {
  const seconds = parseInt(args[0]);
  if (isNaN(seconds) || seconds <= 0) {
    return { output: 'Usage: timer <seconds>', lines: [makeLine('Usage: timer <seconds>', 'error')], exitCode: 1 };
  }

  return {
    output: '',
    lines: [],
    exitCode: 0,
    gameState: { type: 'timer', data: { endTime: Date.now() + seconds * 1000, totalSeconds: seconds } },
    gameMode: 'timer',
  };
}

export function executePassword(): CommandResult {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const length = 16;
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return { output: password, lines: [makeLine(`<span class="text-green-400 font-mono">${password}</span>`, 'success', true)], exitCode: 0 };
}

export function executeUuid(): CommandResult {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return { output: uuid, lines: [makeLine(uuid)], exitCode: 0 };
}

export function executeLorem(args: string[]): CommandResult {
  const wordCount = parseInt(args[0]) || 50;
  const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  
  let text = '';
  for (let i = 0; i < wordCount; i++) {
    text += loremWords[i % loremWords.length] + ' ';
  }
  text = text.trim();
  text = text.charAt(0).toUpperCase() + text.slice(1) + '.';

  return { output: text, lines: [makeLine(text.substring(0, 500))], exitCode: 0 };
}

export function executeQr(args: string[]): CommandResult {
  const text = args.join(' ');
  if (!text) {
    return { output: 'Usage: qr <text>', lines: [makeLine('Usage: qr <text>', 'error')], exitCode: 1 };
  }

  // Simple ASCII QR approximation
  const size = 21;
  let qr = '';
  // Generate a pseudo-random pattern based on text
  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8);
      if (inFinder) {
        const fx = x < 7 ? x : x - (size - 7);
        const fy = y < 7 ? y : y - (size - 7);
        const isBorder = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const isInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        qr += (isBorder || isInner) ? '██' : '  ';
      } else {
        const hash = ((x * 31 + y * 17 + seed) % 100);
        qr += hash > 45 ? '██' : '  ';
      }
    }
    qr += '\n';
  }

  return { output: qr, lines: [makeLine(qr, 'ascii')], exitCode: 0 };
}

export function executeLogo(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine(nexusLogo.trim(), 'ascii'));
  lines.push(makeLine(`<span class="text-cyan-400">NEXUS Terminal v2.0.0</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-gray-400">Built by Abhishek Shah</span>`, 'output', true));
  lines.push(makeLine(`<span class="text-gray-400">Type 'help' to get started.</span>`, 'output', true));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeScore(scores: Record<string, number>): CommandResult {
  const lines: TerminalLine[] = [];

  lines.push(makeLine('<span class="text-cyan-400 font-bold">🏆 High Scores</span>', 'output', true));
  lines.push(makeLine('─────────────────────────────', 'output'));

  const games: Record<string, string> = {
    snake: '🐍 Snake',
    tetris: '🧱 Tetris',
    '2048': '🔢 2048',
    trivia: '🧠 Trivia',
  };

  for (const [key, label] of Object.entries(games)) {
    const score = scores[key] || 0;
    lines.push(makeLine(`  ${label.padEnd(14)} <span class="text-yellow-400">${score}</span>`, 'output', true));
  }

  lines.push(makeLine('─────────────────────────────', 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

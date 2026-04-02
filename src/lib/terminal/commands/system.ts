import { CommandResult, TerminalLine, Theme } from '../types';
import { getFortune } from '../fortune';
import { nexusLogo, neofetchLogo, makeMultiBox } from '../asciiArt';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

const startTime = Date.now();

export function executeWhoami(): CommandResult {
  return { output: 'nexus', lines: [makeLine('nexus')], exitCode: 0 };
}

export function executeHostname(): CommandResult {
  return { output: 'nexus', lines: [makeLine('nexus')], exitCode: 0 };
}

export function executeUname(flags: string[]): CommandResult {
  const all = flags.includes('-a');
  const sysName = 'NEXUS-OS';
  const nodeName = 'nexus';
  const release = '2.0.0';
  const version = '#1 SMP NEXUS';
  const machine = 'x86_64';

  if (all) return { output: `${sysName} ${nodeName} ${release} ${version} ${machine}`, lines: [makeLine(`${sysName} ${nodeName} ${release} ${version} ${machine}`)], exitCode: 0 };
  if (flags.includes('-s')) return { output: sysName, lines: [makeLine(sysName)], exitCode: 0 };
  if (flags.includes('-r')) return { output: release, lines: [makeLine(release)], exitCode: 0 };
  if (flags.includes('-n')) return { output: nodeName, lines: [makeLine(nodeName)], exitCode: 0 };
  if (flags.includes('-m')) return { output: machine, lines: [makeLine(machine)], exitCode: 0 };
  if (flags.includes('-v')) return { output: version, lines: [makeLine(version)], exitCode: 0 };
  return { output: sysName, lines: [makeLine(sysName)], exitCode: 0 };
}

export function executeDate(): CommandResult {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatted = `${days[now.getDay()]} ${months[now.getMonth()]} ${String(now.getDate()).padStart(2, ' ')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} UTC ${now.getFullYear()}`;
  return { output: formatted, lines: [makeLine(formatted)], exitCode: 0 };
}

export function executeUptime(): CommandResult {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const uptimeStr = ` ${time} up ${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}, 1 user, load average: 0.08, 0.03, 0.01`;
  return { output: uptimeStr, lines: [makeLine(uptimeStr)], exitCode: 0 };
}

export function executeClear(): CommandResult {
  return { output: '', lines: [], exitCode: 0, clearScreen: true };
}

export function executeHistory(history: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  history.forEach((cmd, i) => {
    lines.push(makeLine(`  ${String(i + 1).padStart(4)}  ${cmd}`, 'output'));
  });
  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeExit(): CommandResult {
  return { output: 'logout', lines: [makeLine('logout', 'info')], exitCode: 0 };
}

export function executeNeofetch(theme: Theme): CommandResult {
  const lines: TerminalLine[] = [];
  const c = theme.colors;
  const colorize = (text: string, color: string) => `<span style="color:${color}">${text}</span>`;
  const bold = (text: string) => `<span style="font-weight:bold">${text}</span>`;

  const logoLines = neofetchLogo.map(line =>
    line
      .replace(/{red}/g, c.red)
      .replace(/{green}/g, c.green)
      .replace(/{yellow}/g, c.yellow)
      .replace(/{blue}/g, c.blue)
      .replace(/{magenta}/g, c.magenta)
      .replace(/{cyan}/g, c.cyan)
  );

  const infoLines = [
    `${bold(colorize('nexus', c.green))}@${bold(colorize('nexus', c.green))}`,
    `${colorize('-' * 20, c.cyan)}`,
    `${bold(colorize('OS', c.red))}: NEXUS OS 2.0.0 x86_64`,
    `${bold(colorize('Host', c.red))}: NEXUS Virtual Machine`,
    `${bold(colorize('Kernel', c.red))}: 2.0.0-nexus`,
    `${bold(colorize('Uptime', c.red))}: ${Math.floor((Date.now() - startTime) / 60000)} mins`,
    `${bold(colorize('Shell', c.red))}: nexus-sh 2.0.0`,
    `${bold(colorize('Terminal', c.red))}: NEXUS Terminal`,
    `${bold(colorize('CPU', c.red))}: Virtual CPU @ 3.60GHz`,
    `${bold(colorize('Memory', c.red))}: 4096 MiB / 16384 MiB`,
    '',
    `${colorize('██', c.red)}${colorize('██', c.green)}${colorize('██', c.yellow)}${colorize('██', c.blue)}${colorize('██', c.magenta)}${colorize('██', c.cyan)}${colorize('██', c.white)}`,
  ];

  const maxLen = Math.max(logoLines.length, infoLines.length);
  for (let i = 0; i < maxLen; i++) {
    const logo = logoLines[i] || '                          ';
    const info = infoLines[i] || '';
    lines.push(makeLine(`<span style="white-space:pre">${logo}    ${info}</span>`, 'output', true));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeTop(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine(`<span class="text-green-400">top</span> - ${new Date().toLocaleTimeString()} up 1 day, 0:00, 1 user, load average: 0.08, 0.03, 0.01`, 'output', true));
  lines.push(makeLine(`Tasks:   <span class="text-white">127</span> total,   <span class="text-green-400">1</span> running, <span class="text-white">126</span> sleeping,   <span class="text-white">0</span> stopped`, 'output', true));
  lines.push(makeLine(`%Cpu(s):  <span class="text-green-400">3.2</span> us,  <span class="text-blue-400">1.1</span> sy,  <span class="text-yellow-400">0.0</span> ni, <span class="text-white">95.4</span> id,  <span class="text-red-400">0.2</span> wa,  <span class="text-cyan-400">0.1</span> hi`, 'output', true));
  lines.push(makeLine(`MiB Mem:  <span class="text-green-400">16384.0</span> total,   <span class="text-green-400">8388.6</span> free,   <span class="text-yellow-400">4096.0</span> used,   <span class="text-blue-400">3899.4</span> buff/cache`, 'output', true));
  lines.push(makeLine(`MiB Swap: <span class="text-green-400">8192.0</span> total,   <span class="text-green-400">8192.0</span> free,      <span class="text-white">0.0</span> used.  <span class="text-green-400">12288.6</span> avail Mem`, 'output', true));
  lines.push(makeLine(''));
  lines.push(makeLine(`<span class="text-white font-bold">  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND</span>`, 'output', true));
  
  const processes = [
    ['1', 'root', '20', '0', '169344', '13256', '8472', 'S', '0.0', '0.1', '0:02.18', 'systemd'],
    ['423', 'nexus', '20', '0', '1654820', '142680', '46232', 'S', '2.3', '0.9', '1:45.23', 'nexus-terminal'],
    ['567', 'nexus', '20', '0', '324560', '28456', '12340', 'S', '0.7', '0.2', '0:12.45', 'node'],
    ['891', 'nexus', '20', '0', '98432', '8764', '5432', 'S', '0.3', '0.1', '0:03.21', 'bash'],
    ['1024', 'root', '20', '0', '45672', '3420', '2100', 'S', '0.0', '0.0', '0:00.87', 'sshd'],
    ['1234', 'nexus', '20', '0', '210456', '34560', '18760', 'S', '0.5', '0.2', '0:08.92', 'code'],
    ['1456', 'root', '20', '0', '28764', '2340', '1860', 'S', '0.0', '0.0', '0:01.34', 'cron'],
  ];

  for (const proc of processes) {
    const cpu = parseFloat(proc[8]);
    const cpuColor = cpu > 1.5 ? 'text-red-400' : cpu > 0.5 ? 'text-yellow-400' : 'text-green-400';
    lines.push(makeLine(
      `${proc[0].padStart(5)} ${proc[1].padEnd(8)} ${proc[2].padStart(3)} ${proc[3].padStart(3)} ${proc[4].padStart(8)} ${proc[5].padStart(7)} ${proc[6].padStart(6)} ${proc[7].padStart(2)} <span class="${cpuColor}">${proc[8].padStart(5)}</span>  ${proc[9].padStart(5)} ${proc[10].padStart(10)} ${proc[11]}`,
      'output', true
    ));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executePs(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine(`<span class="text-white font-bold">  PID TTY          TIME CMD</span>`, 'output', true));
  const processes = [
    ['  423', 'pts/0', '00:01:45', 'nexus-terminal'],
    ['  567', 'pts/0', '00:00:12', 'node'],
    ['  891', 'pts/0', '00:00:03', 'bash'],
    [' 1234', 'pts/1', '00:00:08', 'code'],
    [`  ${process.pid}`, 'pts/0', '00:00:00', 'ps'],
  ];
  for (const proc of processes) {
    lines.push(makeLine(`${proc[0]} ${proc[1].padEnd(12)} ${proc[2]} ${proc[3]}`, 'output', true));
  }
  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

import { CommandResult, TerminalLine } from '../types';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

export function executePing(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  const host = args.filter(a => !a.startsWith('-'))[0];

  if (!host) {
    return { output: 'Usage: ping <host> [-c count]', lines: [makeLine('Usage: ping <host> [-c count]', 'error')], exitCode: 1 };
  }

  const countIdx = args.indexOf('-c');
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1]) || 4 : 4;

  lines.push(makeLine(`PING ${host} (${randIP()}): 56 data bytes`, 'info'));

  for (let i = 0; i < count; i++) {
    const time = (Math.random() * 50 + 5).toFixed(3);
    lines.push(makeLine(
      `64 bytes from ${randIP()}: icmp_seq=${i} ttl=64 time=${time} ms`,
      'output'
    ));
  }

  const min = (Math.random() * 5 + 3).toFixed(3);
  const avg = (Math.random() * 20 + 10).toFixed(3);
  const max = (Math.random() * 40 + 15).toFixed(3);

  lines.push(makeLine(`\n--- ${host} ping statistics ---`, 'info'));
  lines.push(makeLine(`${count} packets transmitted, ${count} packets received, 0.0% packet loss`, 'success'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeCurl(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  const url = args.filter(a => !a.startsWith('-'))[0];

  if (!url) {
    return { output: 'Usage: curl <url>', lines: [makeLine('Usage: curl <url>', 'error')], exitCode: 1 };
  }

  lines.push(makeLine(`  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`, 'output'));
  lines.push(makeLine(`                                 Dload  Upload   Total   Spent    Left  Speed`, 'output'));
  lines.push(makeLine(`<span class="text-green-400">100  1256  100  1256    0     0  12560      0 --:--:-- --:--:-- --:--:-- 12560</span>`, 'output', true));
  lines.push(makeLine(''));
  lines.push(makeLine('<!DOCTYPE html>', 'output'));
  lines.push(makeLine('<html lang="en">', 'output'));
  lines.push(makeLine('<head>', 'output'));
  lines.push(makeLine('  <meta charset="UTF-8">', 'output'));
  lines.push(makeLine(`  <title>${url}</title>`, 'output'));
  lines.push(makeLine('</head>', 'output'));
  lines.push(makeLine('<body>', 'output'));
  lines.push(makeLine('  <h1>Welcome to ' + url + '</h1>', 'output'));
  lines.push(makeLine('  <p>Simulated response from NEXUS Terminal</p>', 'output'));
  lines.push(makeLine('</body>', 'output'));
  lines.push(makeLine('</html>', 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeIfconfig(): CommandResult {
  const lines: TerminalLine[] = [];
  lines.push(makeLine(`<span class="text-green-400">eth0</span>: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`, 'output', true));
  lines.push(makeLine(`        inet <span class="text-yellow-400">192.168.1.100</span>  netmask 255.255.255.0  broadcast 192.168.1.255`, 'output', true));
  lines.push(makeLine(`        inet6 fe80::a00:27ff:fe8e:1234  prefixlen 64  scopeid 0x20<link>`, 'output'));
  lines.push(makeLine(`        ether 08:00:27:8e:12:34  txqueuelen 1000  (Ethernet)`, 'output'));
  lines.push(makeLine(`        RX packets 158432  bytes 214587320 (204.6 MiB)`, 'output'));
  lines.push(makeLine(`        TX packets 89643  bytes 12456789 (11.8 MiB)`, 'output'));
  lines.push(makeLine(''));
  lines.push(makeLine(`<span class="text-green-400">lo</span>: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`, 'output', true));
  lines.push(makeLine(`        inet <span class="text-yellow-400">127.0.0.1</span>  netmask 255.0.0.0`, 'output', true));
  lines.push(makeLine(`        inet6 ::1  prefixlen 128  scopeid 0x10<host>`, 'output'));
  lines.push(makeLine(`        loop  txqueuelen 1000  (Local Loopback)`, 'output'));
  lines.push(makeLine(`        RX packets 4231  bytes 356421 (348.0 KiB)`, 'output'));
  lines.push(makeLine(`        TX packets 4231  bytes 356421 (348.0 KiB)`, 'output'));

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeIp(): CommandResult {
  return executeIfconfig();
}

export function executeTraceroute(args: string[]): CommandResult {
  const lines: TerminalLine[] = [];
  const host = args.filter(a => !a.startsWith('-'))[0];

  if (!host) {
    return { output: 'Usage: traceroute <host>', lines: [makeLine('Usage: traceroute <host>', 'error')], exitCode: 1 };
  }

  lines.push(makeLine(`traceroute to ${host} (${randIP()}), 30 hops max, 60 byte packets`, 'info'));

  const hops = [
    { num: 1, ip: '192.168.1.1', name: 'gateway', times: [0.5, 0.3, 0.4] },
    { num: 2, ip: '10.0.0.1', name: 'isp-router', times: [5.2, 4.8, 5.1] },
    { num: 3, ip: '72.14.215.85', name: 'core-rtr', times: [12.3, 11.8, 12.1] },
    { num: 4, ip: '108.170.252.129', name: 'edge-node', times: [18.7, 19.2, 18.5] },
    { num: 5, ip: '142.251.49.23', name: 'cdn-node', times: [22.1, 21.8, 22.3] },
  ];

  for (const hop of hops) {
    lines.push(makeLine(
      ` ${String(hop.num).padStart(2)}  ${hop.name} (${hop.ip})  ${hop.times.map(t => t.toFixed(3) + ' ms').join('  ')}`,
      'output'
    ));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export function executeSsh(): CommandResult {
  return {
    output: 'ssh: Connection not supported in browser terminal',
    lines: [makeLine('<span class="text-yellow-400">⚠ ssh: SSH connections are not supported in the browser-based terminal environment.</span>', 'warning', true), makeLine('  For secure connections, please use a native terminal client.', 'info')],
    exitCode: 1,
  };
}

export function executeWget(): CommandResult {
  return {
    output: 'wget: Feature not available in browser terminal',
    lines: [makeLine('<span class="text-yellow-400">⚠ wget: File downloads are not supported in the browser-based terminal environment.</span>', 'warning', true)],
    exitCode: 1,
  };
}

function randIP(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

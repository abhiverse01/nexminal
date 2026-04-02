import { TerminalSession, CommandResult, FileNode, TerminalLine, GameState, Theme } from './types';
import { getDefaultEnv, expandVariables } from './environment';
import { initFileSystem, resolvePath, getNode } from './virtualFileSystem';
import { parseCommand, resolveAlias } from './commandParser';
import { getCompletions } from './tabCompletion';
import { getTheme } from './themes';
import { getFortune } from './fortune';
import { nexusLogo } from './asciiArt';
import {
  executeLs, executeCd, executePwd, executeTree,
  executeCat, executeTouch, executeMkdir, executeRmdir, executeRm, executeCp, executeMv, executeEcho, executeWrite, executeHead, executeTail,
  executeWhoami, executeHostname, executeUname, executeDate, executeUptime, executeClear, executeHistory, executeExit, executeNeofetch, executeTop, executePs,
  executePing, executeCurl, executeIfconfig, executeIp, executeTraceroute, executeSsh, executeWget,
  executeCalc, executeBase64, executeMd5, executeSha256, executeRev, executeSort, executeWc, executeGrep, executeFind, executeDiff, executeUniq, executeTr, executeSed, executeXargs,
  executeCowsay, executeFortune, executeMatrix, executeColor, executeFiglet, executeLolcat, executeSl, executeCmatrix, executeOneko,
  executeAbout, executeContact, executeResume, executeSocial,
  executeGames, launchGame, handleGameInput, renderGame,
  executeHelp, executeMan, executeTheme, executeWeather, executeTodo, executeNotes, executeNano, executeAlias, executeExport, executeEnv, executeWhich, executeWhatis, executeDf, executeFree, executeCal, executeStopwatch, executeTimer, executePassword, executeUuid, executeLorem, executeQr, executeLogo, executeScore,
} from './commands';

let sessionCounter = 0;

export function createSession(): TerminalSession {
  sessionCounter++;
  return {
    id: `session-${sessionCounter}`,
    name: `Terminal ${sessionCounter}`,
    history: [],
    historyIndex: -1,
    cwd: '/home/nexus',
    env: getDefaultEnv(),
    output: [],
    gameState: null,
    gameMode: 'none',
    previousCwd: '/home/nexus',
    aliases: {
      ll: 'ls -la',
      la: 'ls -a',
      cls: 'clear',
      '..': 'cd ..',
      '...': 'cd ../..',
      h: 'history',
      c: 'clear',
      md: 'mkdir',
      rd: 'rmdir',
      bc: 'calc',
    },
    todos: [],
    notes: [],
  };
}

export function createInitialOutput(): TerminalLine[] {
  const lines: TerminalLine[] = [];
  let lc = 0;
  const ml = (content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine => ({
    id: `init-${++lc}`, content, type, html,
  });

  lines.push(ml(nexusLogo.trim(), 'ascii'));
  lines.push(ml('', 'output'));
  lines.push(ml('<span class="text-cyan-400">NEXUS Terminal v2.0.0</span>', 'output', true));
  lines.push(ml('<span class="text-gray-400">Built by <span class="text-green-400">Abhishek Shah</span></span>', 'output', true));
  lines.push(ml(`<span class="text-gray-400">LinkedIn: <span class="text-cyan-400">linkedin.com/in/theabhishekshah</span> | GitHub: <span class="text-cyan-400">github.com/abhiverse01</span></span>`, 'output', true));
  lines.push(ml('', 'output'));
  lines.push(ml(`<span class="text-yellow-400">💡 Welcome! Type <span class="text-green-400">help</span> for commands, <span class="text-green-400">games</span> to play, <span class="text-green-400">about</span> for developer info.</span>`, 'output', true));
  lines.push(ml('', 'output'));

  const fortune = getFortune();
  lines.push(ml(`<span class="text-gray-500">🎲 ${fortune}</span>`, 'info', true));
  lines.push(ml('', 'output'));

  return lines;
}

export function getFileSystem(): FileNode {
  return initFileSystem();
}

export function getTabCompletions(input: string, cwd: string, fs: FileNode) {
  return getCompletions(input, cwd, fs);
}

export function executeCommand(
  session: TerminalSession,
  fs: FileNode,
  theme: Theme
): { result: CommandResult; updatedSession: TerminalSession; updatedFs: FileNode } {
  const lastInput = session.output.filter(l => l.type === 'input').pop()?.content || '';
  if (!lastInput.trim()) return { result: { output: '', lines: [], exitCode: 0 }, updatedSession: session, updatedFs: fs };

  let input = expandVariables(lastInput, session.env);
  const parsed = parseCommand(input);
  
  if (!parsed.command) return { result: { output: '', lines: [], exitCode: 0 }, updatedSession: session, updatedFs: fs };

  // Resolve alias
  let resolvedCmd = resolveAlias(parsed.command, session.aliases);
  if (resolvedCmd !== parsed.command) {
    resolvedCmd += ' ' + parsed.args.join(' ');
    input = resolvedCmd;
    const reparsed = parseCommand(resolvedCmd);
    executeParsedCommand(reparsed, session, fs, theme);
  }

  return executeParsedCommand(parsed, session, fs, theme);
}

function executeParsedCommand(
  parsed: ReturnType<typeof parseCommand>,
  session: TerminalSession,
  fs: FileNode,
  theme: Theme
): { result: CommandResult; updatedSession: TerminalSession; updatedFs: FileNode } {
  const { command, args, flags } = parsed;
  const cmd = command.toLowerCase();
  const updatedSession = { ...session };
  let updatedFs = fs;
  let result: CommandResult;

  switch (cmd) {
    case 'ls': result = executeLs(args, flags, updatedSession.cwd, updatedFs); break;
    case 'cd': result = executeCd(args, updatedSession.cwd, updatedFs); break;
    case 'pwd': result = executePwd(updatedSession.cwd); break;
    case 'tree': result = executeTree(args, updatedSession.cwd, updatedFs); break;
    case 'cat': result = executeCat(args, updatedSession.cwd, updatedFs); break;
    case 'touch': result = executeTouch(args, updatedSession.cwd, updatedFs); break;
    case 'mkdir': result = executeMkdir(args, updatedSession.cwd, updatedFs); break;
    case 'rmdir': result = executeRmdir(args, updatedSession.cwd, updatedFs); break;
    case 'rm': result = executeRm(args, updatedSession.cwd, updatedFs); break;
    case 'cp': result = executeCp(args, updatedSession.cwd, updatedFs); break;
    case 'mv': result = executeMv(args, updatedSession.cwd, updatedFs); break;
    case 'echo': result = executeEcho(args, flags); break;
    case 'write': result = executeWrite(args, updatedSession.cwd, updatedFs); break;
    case 'head': result = executeHead(args, updatedSession.cwd, updatedFs); break;
    case 'tail': result = executeTail(args, updatedSession.cwd, updatedFs); break;
    case 'whoami': result = executeWhoami(); break;
    case 'hostname': result = executeHostname(); break;
    case 'uname': result = executeUname(flags); break;
    case 'date': result = executeDate(); break;
    case 'uptime': result = executeUptime(); break;
    case 'clear':
    case 'cls': result = executeClear(); break;
    case 'history': result = executeHistory(updatedSession.history); break;
    case 'exit': result = executeExit(); break;
    case 'neofetch': result = executeNeofetch(theme); break;
    case 'top':
    case 'htop': result = executeTop(); break;
    case 'ps': result = executePs(); break;
    case 'ping': result = executePing(args); break;
    case 'curl': result = executeCurl(args); break;
    case 'ifconfig': result = executeIfconfig(); break;
    case 'ip': result = executeIp(); break;
    case 'traceroute': result = executeTraceroute(args); break;
    case 'ssh': result = executeSsh(); break;
    case 'wget': result = executeWget(); break;
    case 'calc':
    case 'bc': result = executeCalc(args); break;
    case 'base64': result = executeBase64(args); break;
    case 'md5': result = executeMd5(args); break;
    case 'sha256': result = executeSha256(args); break;
    case 'rev': result = executeRev(args); break;
    case 'sort': result = executeSort(args, updatedSession.cwd, updatedFs); break;
    case 'wc': result = executeWc(args, updatedSession.cwd, updatedFs); break;
    case 'grep': result = executeGrep(args, updatedSession.cwd, updatedFs); break;
    case 'find': result = executeFind(args, updatedSession.cwd, updatedFs); break;
    case 'diff': result = executeDiff(args, updatedSession.cwd, updatedFs); break;
    case 'uniq': result = executeUniq(args); break;
    case 'tr': result = executeTr(args); break;
    case 'sed': result = executeSed(args); break;
    case 'xargs': result = executeXargs(args); break;
    case 'cowsay': result = executeCowsay(args); break;
    case 'fortune': result = executeFortune(); break;
    case 'matrix': result = executeMatrix(); break;
    case 'color': result = executeColor(args); break;
    case 'figlet':
    case 'banner': result = executeFiglet(args); break;
    case 'lolcat': result = executeLolcat(args); break;
    case 'sl': result = executeSl(); break;
    case 'cmatrix': result = executeCmatrix(); break;
    case 'oneko': result = executeOneko(); break;
    case 'about':
    case 'abhishek':
    case 'dev': result = executeAbout(); break;
    case 'contact': result = executeContact(); break;
    case 'resume': result = executeResume(); break;
    case 'social': result = executeSocial(); break;
    case 'games': result = executeGames(); break;
    case 'play': result = launchGame(args.join(' ')); break;
    case 'score': result = executeScore({}); break;
    case 'help': result = executeHelp(); break;
    case 'man': result = executeMan(args); break;
    case 'theme': result = executeTheme(args, theme.name); break;
    case 'weather': result = executeWeather(args); break;
    case 'todo': result = executeTodo(args, updatedSession.todos); break;
    case 'notes': result = executeNotes(args, updatedSession.notes); break;
    case 'nano': result = executeNano(args, updatedSession.cwd, updatedFs); break;
    case 'alias': result = executeAlias(args, updatedSession.aliases); break;
    case 'export': result = executeExport(args, updatedSession.env); break;
    case 'env':
    case 'printenv': result = executeEnv(updatedSession.env); break;
    case 'which': result = executeWhich(args); break;
    case 'whatis': result = executeWhatis(args); break;
    case 'df': result = executeDf(); break;
    case 'free': result = executeFree(); break;
    case 'cal': result = executeCal(args); break;
    case 'stopwatch': result = executeStopwatch(); break;
    case 'timer': result = executeTimer(args); break;
    case 'password': result = executePassword(); break;
    case 'uuid': result = executeUuid(); break;
    case 'lorem': result = executeLorem(args); break;
    case 'qr': result = executeQr(args); break;
    case 'logo': result = executeLogo(); break;
    default:
      result = {
        output: `nexus-sh: command not found: ${cmd}`,
        lines: [{ id: `err-${Date.now()}`, content: `nexus-sh: command not found: ${cmd}`, type: 'error' }],
        exitCode: 127,
      };
  }

  // Handle result modifications
  if (result.changeCwd) {
    if (result.changeCwd === 'PREV') {
      const prev = updatedSession.previousCwd || updatedSession.cwd;
      updatedSession.previousCwd = updatedSession.cwd;
      updatedSession.cwd = prev;
    } else {
      updatedSession.previousCwd = updatedSession.cwd;
      updatedSession.cwd = result.changeCwd;
    }
    updatedSession.env.PWD = updatedSession.cwd;
  }

  if (result.gameState && result.gameMode) {
    updatedSession.gameState = result.gameState;
    updatedSession.gameMode = result.gameMode as TerminalSession['gameMode'];
  }

  if (result.setAlias) {
    updatedSession.aliases = { ...updatedSession.aliases, [result.setAlias.name]: result.setAlias.value };
  }

  if (result.removeAlias) {
    const newAliases = { ...updatedSession.aliases };
    delete newAliases[result.removeAlias];
    updatedSession.aliases = newAliases;
  }

  // Handle export env var
  if (result.gameState?.type === 'export') {
    const d = result.gameState.data;
    if (d && typeof d === 'object' && 'key' in d && 'value' in d) {
      updatedSession.env = { ...updatedSession.env, [d.key as string]: d.value as string };
      updatedSession.gameState = null;
      updatedSession.gameMode = 'none';
    }
  }

  return { result, updatedSession, updatedFs };
}

export function handleGameKey(
  session: TerminalSession,
  key: string
): { updatedSession: TerminalSession; result: CommandResult | null } {
  if (!session.gameState || session.gameMode === 'none') {
    return { updatedSession: session, result: null };
  }

  const { newState, result } = handleGameInput(session.gameMode, session.gameState, key);

  return {
    updatedSession: {
      ...session,
      gameState: newState,
    },
    result,
  };
}

export function getCurrentGameRender(session: TerminalSession): CommandResult | null {
  if (!session.gameState || session.gameMode === 'none') return null;
  return renderGame(session.gameMode, session.gameState);
}

export * from './types';
export { getTheme, getThemeNames } from './themes';
export { expandVariables, expandTilde, getDefaultEnv } from './environment';

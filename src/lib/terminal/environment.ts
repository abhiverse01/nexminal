export const NEXUS_VERSION = '2.0.0';

export function getDefaultEnv(): Record<string, string> {
  return {
    USER: 'nexus',
    HOME: '/home/nexus',
    SHELL: '/bin/nexus-sh',
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    PWD: '/home/nexus',
    TERM: 'nexus-256color',
    LANG: 'en_US.UTF-8',
    EDITOR: 'nano',
    NEXUS_VERSION: NEXUS_VERSION,
    HOSTNAME: 'nexus',
    PS1: '\\u@\\h:\\w\\$ ',
    OLDPWD: '/home/nexus',
    _: '/usr/bin/nexus',
    SHLVL: '1',
    LOGNAME: 'nexus',
    MAIL: '/var/mail/nexus',
    BROWSER: 'nexus-browser',
    XDG_CONFIG_HOME: '/home/nexus/.config',
    XDG_DATA_HOME: '/home/nexus/.local/share',
    XDG_CACHE_HOME: '/home/nexus/.cache',
    LS_COLORS: 'di=1;34:ln=1;36:so=1;35:pi=40;33:ex=1;32',
    HISTSIZE: '1000',
    HISTFILE: '/home/nexus/.bash_history',
    PROMPT_COMMAND: '',
    COLORTERM: 'truecolor',
  };
}

export function expandVariables(text: string, env: Record<string, string>): string {
  return text.replace(/\$\{(\w+)\}|\$(\w+)/g, (_match, braced, plain) => {
    const key = braced || plain;
    return env[key] || '';
  });
}

export function expandTilde(path: string, homeDir: string): string {
  if (path === '~') return homeDir;
  if (path.startsWith('~/')) return homeDir + path.slice(1);
  return path;
}

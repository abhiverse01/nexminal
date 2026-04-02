export const nexusLogo = `
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
██║╚██╗██║██╔════╝ ██╔██╗ ██║   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝`;

export const abhishekAscii = `
   ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗
   ██║██╔══██╗██╔═══██╗████╗  ██║██╔════╝
   ██║██████╔╝██║   ██║██╔██╗ ██║██║  ███╗
   ██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║
   ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝
   ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝`;

export const neofetchLogo = [
  '{red}        _nnnn_      ',
  '{green}       dGGGGMMb     ',
  '{yellow}      @p~qp~~qMb    ',
  '{blue}      M|@||@) M|    ',
  '{magenta}      @,----.JM|    ',
  '{cyan}     JS^\\__/  qKL   ',
  '{red}    dZP        qKRb ',
  '{green}   dZP          qKKb',
  '{yellow}  fZP            SMMb',
  '{blue}  HZM            MMMM',
  '{magenta}  FqM            MMMM',
  '{cyan} __j__.         .dMM',
  '{red} |~www@MMMMMMMN.  |',
  '{green} JS^\\    ~MMMMMMM |',
  '{yellow} MMMM    MMMMMMMM.',
  '{blue} MMMMN   MMMMMMMMM.',
  '{magenta} MMMMMMN.MMMMMMMM',
  '{cyan}  MMMMMMMMMMMMMMM.',
  '   MMMMMMMMMMMMM',
  '     MMMMMMMM',
  '        MM',
];

export const cowsayAnimals: Record<string, string[]> = {
  cow: [
    ' {text}',
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ],
  tux: [
    ' {text}',
    '   \\',
    '    \\',
    '        .--.',
    '       |o_o |',
    '       |:_/ |',
    '      //   \\ \\',
    '     (|     | )',
    '    /\'\\_   _/`\\',
    '    \\___)=(___/',
  ],
  dragon: [
    ' {text}',
    '    \\                    / \\  //\\',
    '     \\    |\\___/|      /   \\//  \\\\',
    '      \\   /0  0  \\__  /    //  | \\ \\',
    '         /     /  \\/_/    //   |  \\  \\',
    '         @_^_@\'/   \\/_   //    |   \\   \\',
    '         //_^_/     \\/_ //     |    \\    \\',
    '      ( //) |        \\///      |     \\     \\',
    '    ( / /) _|_ /   )  //       |      \\     _\\',
    '  ( / /) //,/ \\ _ /) / //      |       \\   /   \\',
    '(__//   \\ \\/(_// / //         |        \\ /     \\',
    '         //      \\//          /\\         /        \\',
    '    (//       \\/  //         /  \\      /           \\',
    '      //    /\\   //         /    \\   /             \\',
    '   (/ //    \\  \\//        /\'      \\_/               \\',
    '   ///       \\  \\//     /\'         |                  \\',
    '  ///          \\  \\//  /\'          |                    \\',
    ' ///             \\  \\/ /\'           |                    \\',
  ],
  turtle: [
    ' {text}',
    '      \\',
    '       \\',
    '        ___',
    '      /     \\',
    '     |  O O  |',
    '      \\  ~  /',
    '    .-`\\___/`-.',
    '   /   |   |   \\',
    '  |    |   |    |',
    '   \\   \\___/   /',
    '    `-._____.-\'',
  ],
  ghost: [
    ' {text}',
    '    \\',
    '     \\',
    '      .---.',
    '     /     \\',
    '    | () () |',
    '     \\  ^  /',
    '      |||||',
    '      |||||',
  ],
  cat: [
    ' {text}',
    '    \\',
    '     \\',
    '       /\\_/\\',
    '      ( o.o )',
    '       > ^ <',
    '      /|   |\\',
    '     (_|   |_)',
  ],
  owl: [
    ' {text}',
    '    \\',
    '     \\',
    '       ,___',
    '      /,-.  \\',
    '      | o o |',
    '      \\  _  /',
    '       `---\'',
  ],
  stegosaurus: [
    ' {text}',
    '    \\',
    '     \\',
    '         __',
    '        /  \\',
    '       / ..|\\',
    '       \\___/',
    '        /  \\',
    '    /\\  / /\\  /\\',
    '   /  \\/ /  \\/  \\',
    '   \\    /\\    /',
  ],
  elephant: [
    ' {text}',
    '    \\',
    '     \\',
    '       _    _',
    '      / \\~~~/ \\',
    '    ,----( .. )',
    '   /      \\___\\',
    '  /|         (\\',
    ' ^ \\   /___\\  /\\',
    '    |__|   |__| -',
  ],
};

export function generateCowsay(text: string, animal: string = 'cow'): string {
  const animalLines = cowsayAnimals[animal] || cowsayAnimals.cow;
  const maxLen = Math.min(text.length, 40);
  const lines: string[] = [];
  
  if (text.length <= maxLen) {
    lines.push(` ${text}`);
  } else {
    const words = text.split(' ');
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxLen && current) {
        lines.push(` ${current}`);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(` ${current}`);
  }

  const borderLen = Math.max(...lines.map(l => l.length)) + 2;
  const top = ' ' + '_'.repeat(borderLen);
  const bottom = ' ' + '-'.repeat(borderLen);

  return [...lines.map(l => l.padEnd(borderLen + 1) + '|'), bottom, ...animalLines].join('\n');
}

export function generateFiglet(text: string): string {
  const letters: Record<string, string[]> = {
    A: ['  /\\  ', ' /  \\ ', '/----\\', '/    \\/'],
    B: ['|###  ', '|#__\\ ', '|##_| ', '|____/'],
    C: [' ___ ', '|    ', '|    ', '|___ '],
    D: ['|##\\ ', '| #__\\', '|__/|', '|   \\|'],
    E: ['|### ', '|#__ ', '|##  ', '|____'],
    F: ['|### ', '|#__ ', '|##  ', '|    '],
    G: [' ___ ', '|    ', '| #__ ', '|___|'],
    H: ['|   /|', '|#__ |', '|   \\|', '|    |'],
    I: [' ___ ', '|__| ', '|  | ', '|__| '],
    J: ['  ___', '   | ', ' __| ', '|___ '],
    K: ['|  / ', '| /  ', '|/ \\ ', '|  \\ '],
    L: ['|    ', '|    ', '|    ', '|____'],
    M: ['|\\/\\/|', '|    |', '|    |', '|    |'],
    N: ['|\\   |', '| \\  |', '|  \\ |', '|   \\|'],
    O: [' ___ ', '/   \\', '\\___/', '\\   /'],
    P: ['|##\\ ', '|__| ', '|    ', '|    '],
    Q: [' ___ ', '/   \\', '\\___/', '  \\|'],
    R: ['|##\\ ', '|__| ', '| /\\ ', '|/  \\|'],
    S: [' ___ ', '|    ', ' \\___', '____|'],
    T: ['#####', '  |  ', '  |  ', '  |  '],
    U: ['|   |', '|   |', '|   |', '\\___|'],
    V: ['\\   /', '\\  / ', ' \\/  ', '  |  '],
    W: ['|   |', '|   |', '| _ |', '|/ \\|'],
    X: ['\\   /', ' \\ / ', '  |  ', ' / \\ '],
    Y: ['\\   /', ' \\ / ', '  |  ', '  |  '],
    Z: ['____/', '  /  ', ' /__ ', '  __/'],
    ' ': ['    ', '    ', '    ', '    '],
  };

  const upper = text.toUpperCase();
  const result = ['', '', '', ''];
  
  for (const char of upper) {
    const glyph = letters[char] || letters[' '];
    for (let i = 0; i < 4; i++) {
      result[i] += glyph[i];
    }
  }

  return result.join('\n');
}

export const boxBorders = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  round:  { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  bold:   { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
};

export function makeBox(text: string, borderType: keyof typeof boxBorders = 'double', width = 50): string {
  const b = boxBorders[borderType];
  const innerWidth = width - 4;
  const lines: string[] = [`${b.tl}${b.h.repeat(width - 2)}${b.tr}`];
  
  if (text.length <= innerWidth) {
    const padded = text.padEnd(innerWidth);
    lines.push(`${b.v} ${padded} ${b.v}`);
  } else {
    const words = text.split(' ');
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > innerWidth && current) {
        lines.push(`${b.v} ${current.padEnd(innerWidth)} ${b.v}`);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(`${b.v} ${current.padEnd(innerWidth)} ${b.v}`);
  }
  
  lines.push(`${b.bl}${b.h.repeat(width - 2)}${b.br}`);
  return lines.join('\n');
}

export function makeMultiBox(lines: string[], borderType: keyof typeof boxBorders = 'double', width = 50): string {
  const b = boxBorders[borderType];
  const innerWidth = width - 4;
  const result: string[] = [`${b.tl}${b.h.repeat(width - 2)}${b.tr}`];
  
  for (const line of lines) {
    result.push(`${b.v} ${line.padEnd(innerWidth)} ${b.v}`);
  }
  
  result.push(`${b.bl}${b.h.repeat(width - 2)}${b.br}`);
  return result.join('\n');
}

export const slArt = [
  '      ___          ___    ___          ___',
  '     /   \\        /   \\  /   \\        /   \\',
  '    / ..  \\      / ..  \\/ ..  \\      / ..  \\',
  '   |  |  |  \\   |  |  | |  |  |  \\  |  |  |',
  '   |  |  |   |  |  |  | |  |  |   | |  |  |',
  '   |____|   |  |____|/  |____|   | |____|/',
  '    |   |   |   |   |    |   |   |   |   |',
  '    |   |   |   |   |    |   |   |   |   |',
  '    |___|   |   |___|    |___|   |   |___|',
  '     \\_/ \\_/     \\_/      \\_/ \\_/     \\_/',
  '     / \\ / \\     / \\      / \\ / \\     / \\',
  '    /   V   \\   /   V    /   V   \\   /   V',
  '  []|[]   []|[]|[]   []|[]|[]   []|[]|[]',
  '  []|[]   []|[]|[]   []|[]|[]   []|[]|[]',
  '  []|[]   []|[]|[]   []|[]|[]   []|[]|[]',
  '======================(O)====================',
];

export const matrixChars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

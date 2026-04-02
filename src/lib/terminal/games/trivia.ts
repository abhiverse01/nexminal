import { GameState, CommandResult, TerminalLine } from '../types';

let lineCounter = 0;
function makeLine(content: string, type: TerminalLine['type'] = 'output', html = false): TerminalLine {
  return { id: `line-${++lineCounter}`, content, type, html };
}

interface TriviaQuestion {
  question: string;
  options: string[];
  answer: number;
  category: string;
}

interface TriviaState {
  questions: TriviaQuestion[];
  currentIndex: number;
  score: number;
  total: number;
  answered: boolean;
  selectedAnswer: number | null;
  gameOver: boolean;
}

const allQuestions: TriviaQuestion[] = [
  { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], answer: 0, category: 'Technology' },
  { question: 'What year was JavaScript created?', options: ['1993', '1995', '1997', '2000'], answer: 1, category: 'Technology' },
  { question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2, category: 'Geography' },
  { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1, category: 'Science' },
  { question: 'What is the speed of light (approx)?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], answer: 0, category: 'Science' },
  { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], answer: 1, category: 'History' },
  { question: 'What is 2^10?', options: ['512', '1024', '2048', '4096'], answer: 1, category: 'Math' },
  { question: 'Which country has the longest coastline?', options: ['Russia', 'Canada', 'Australia', 'Indonesia'], answer: 1, category: 'Geography' },
  { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], answer: 0, category: 'Technology' },
  { question: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2, category: 'Geography' },
  { question: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], answer: 2, category: 'History' },
  { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, category: 'Science' },
  { question: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], answer: 2, category: 'Math' },
  { question: 'Who founded Microsoft?', options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos'], answer: 1, category: 'Technology' },
  { question: 'What is the tallest mountain?', options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'], answer: 2, category: 'Geography' },
  { question: 'What programming language is known as the "language of the web"?', options: ['Python', 'Java', 'JavaScript', 'C++'], answer: 2, category: 'Technology' },
  { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], answer: 2, category: 'Math' },
  { question: 'Which element has atomic number 1?', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'], answer: 1, category: 'Science' },
  { question: 'What year was the first iPhone released?', options: ['2005', '2006', '2007', '2008'], answer: 2, category: 'Technology' },
  { question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2, category: 'Geography' },
  { question: 'What is the Fibonacci sequence starting?', options: ['1, 1, 2, 3, 5', '0, 1, 1, 2, 3', '1, 2, 3, 4, 5', '0, 2, 4, 6, 8'], answer: 0, category: 'Math' },
  { question: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1, category: 'History' },
  { question: 'What is the main component of the Sun?', options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'], answer: 1, category: 'Science' },
];

function shuffleQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

export function initTrivia(): GameState {
  const questions = shuffleQuestions(allQuestions);

  return {
    type: 'trivia',
    data: {
      questions,
      currentIndex: 0,
      score: 0,
      total: questions.length,
      answered: false,
      selectedAnswer: null,
      gameOver: false,
    } as unknown as Record<string, unknown>,
  };
}

export function handleTriviaInput(gameState: GameState, key: string): GameState {
  const state = gameState.data as unknown as TriviaState;

  if (key === 'q' || key === 'Escape') {
    return { type: 'trivia', data: { ...state, gameOver: true } as unknown as Record<string, unknown> };
  }

  if (state.gameOver) return gameState;

  // If already answered, go to next question
  if (state.answered) {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.total) {
      return { type: 'trivia', data: { ...state, gameOver: true } as unknown as Record<string, unknown> };
    }
    return {
      type: 'trivia',
      data: {
        ...state,
        currentIndex: nextIndex,
        answered: false,
        selectedAnswer: null,
      } as unknown as Record<string, unknown>,
    };
  }

  // Select answer
  let answerIdx = -1;
  if (key === 'a' || key === '1') answerIdx = 0;
  if (key === 'b' || key === '2') answerIdx = 1;
  if (key === 'c' || key === '3') answerIdx = 2;
  if (key === 'd' || key === '4') answerIdx = 3;

  if (answerIdx === -1) return gameState;

  const isCorrect = answerIdx === state.questions[state.currentIndex].answer;
  const newScore = isCorrect ? state.score + 1 : state.score;

  return {
    type: 'trivia',
    data: {
      ...state,
      score: newScore,
      answered: true,
      selectedAnswer: answerIdx,
    } as unknown as Record<string, unknown>,
  };
}

export function renderTrivia(gameState: GameState): CommandResult {
  const state = gameState.data as unknown as TriviaState;
  const lines: TerminalLine[] = [];

  if (state.gameOver) {
    lines.push(makeLine(`<span class="text-cyan-400 font-bold">🧠 TRIVIA COMPLETE!</span>`, 'output', true));
    lines.push(makeLine('', 'output'));

    const percentage = Math.round((state.score / state.total) * 100);
    let emoji = '🏆';
    let msg = 'Perfect score! You\'re a genius!';
    if (percentage < 50) { emoji = '📚'; msg = 'Keep learning!'; }
    else if (percentage < 80) { emoji = '👍'; msg = 'Good job!'; }
    else if (percentage < 100) { emoji = '🌟'; msg = 'Excellent!'; }

    lines.push(makeLine(`  ${emoji} Score: <span class="text-yellow-400">${state.score}/${state.total}</span> (${percentage}%)`, 'output', true));
    lines.push(makeLine(`  ${msg}`, 'info', true));
    lines.push(makeLine('', 'output'));
    lines.push(makeLine('<span class="text-gray-400">Press any key to continue...</span>', 'output', true));
    return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
  }

  const q = state.questions[state.currentIndex];
  lines.push(makeLine(`<span class="text-cyan-400 font-bold">🧠 TRIVIA</span>  Question ${state.currentIndex + 1}/${state.total}  Score: <span class="text-yellow-400">${state.score}</span>  <span class="text-gray-500">[${q.category}]</span>`, 'output', true));
  lines.push(makeLine('', 'output'));
  lines.push(makeLine(`<span class="text-white font-bold">${q.question}</span>`, 'output', true));
  lines.push(makeLine('', 'output'));

  const labels = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < q.options.length; i++) {
    const label = labels[i].toUpperCase();
    let prefix = `  <span class="text-cyan-400">[${label}]</span>`;
    let option = q.options[i];

    if (state.answered) {
      if (i === q.answer) {
        prefix = `  <span class="text-green-400 font-bold">[${label}] ✓</span>`;
        option = `<span class="text-green-400">${option}</span>`;
      } else if (i === state.selectedAnswer && i !== q.answer) {
        prefix = `  <span class="text-red-400 font-bold">[${label}] ✗</span>`;
        option = `<span class="text-red-400 line-through">${option}</span>`;
      }
    }

    lines.push(makeLine(`${prefix} ${option}`, 'output', true));
  }

  lines.push(makeLine('', 'output'));

  if (state.answered) {
    const isCorrect = state.selectedAnswer === q.answer;
    lines.push(makeLine(
      isCorrect
        ? '<span class="text-green-400">✅ Correct!</span> <span class="text-gray-400">Press any key for next question...</span>'
        : '<span class="text-red-400">❌ Wrong!</span> <span class="text-gray-400">Press any key for next question...</span>',
      'output', true
    ));
  } else {
    lines.push(makeLine('<span class="text-gray-500">Type a/b/c/d or 1/2/3/4 to answer | Q to quit</span>', 'output', true));
  }

  return { output: lines.map(l => l.content).join('\n'), lines, exitCode: 0 };
}

export class CommandHistory {
  private history: string[] = [];
  private index = -1;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  add(command: string): void {
    const trimmed = command.trim();
    if (!trimmed) return;
    // Don't add duplicates of the most recent command
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      this.index = this.history.length;
      return;
    }
    this.history.push(trimmed);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    this.index = this.history.length;
  }

  getPrevious(): string | null {
    if (this.index <= 0) return null;
    this.index--;
    return this.history[this.index];
  }

  getNext(): string | null {
    if (this.index >= this.history.length - 1) {
      this.index = this.history.length;
      return null;
    }
    this.index++;
    return this.history[this.index];
  }

  resetIndex(): void {
    this.index = this.history.length;
  }

  getAll(): string[] {
    return [...this.history];
  }

  search(query: string): number[] {
    if (!query) return [];
    const lower = query.toLowerCase();
    const matches: number[] = [];
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].toLowerCase().includes(lower)) {
        matches.push(i);
      }
    }
    return matches;
  }

  getByIndex(idx: number): string | null {
    if (idx >= 0 && idx < this.history.length) return this.history[idx];
    return null;
  }

  get length(): number {
    return this.history.length;
  }

  clear(): void {
    this.history = [];
    this.index = -1;
  }
}

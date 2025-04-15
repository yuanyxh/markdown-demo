import type { Text } from '@/node';
import type { DelimiterRun } from '@/parser';

/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 */
class Delimiter implements DelimiterRun {
  readonly characters: Text[];
  readonly delimiterChar: string;
  private readonly originalLength: number;

  // Can open emphasis, see spec.
  private readonly canOpen: boolean;

  // Can close emphasis, see spec.
  private readonly canClose: boolean;

  previous: Delimiter | null = null;
  next: Delimiter | null = null;

  constructor(
    characters: Text[],
    delimiterChar: string,
    canOpen: boolean,
    canClose: boolean,
    previous: Delimiter | null
  ) {
    this.characters = characters;
    this.delimiterChar = delimiterChar;
    this.canOpen = canOpen;
    this.canClose = canClose;
    this.previous = previous;
    this.originalLength = characters.length;
  }

  getCanOpen(): boolean {
    return this.canOpen;
  }

  getCanClose(): boolean {
    return this.canClose;
  }

  length(): number {
    return this.characters.length;
  }

  getOriginalLength(): number {
    return this.originalLength;
  }

  getOpener(): Text {
    return this.characters[this.characters.length - 1];
  }

  getCloser(): Text {
    return this.characters[0];
  }

  getOpeners(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error('length must be between 1 and ' + this.length() + ', was ' + length);
    }

    return this.characters.slice(this.characters.length - length, this.characters.length);
  }

  getClosers(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error('length must be between 1 and ' + this.length() + ', was ' + length);
    }

    return this.characters.slice(0, length);
  }
}

export default Delimiter;

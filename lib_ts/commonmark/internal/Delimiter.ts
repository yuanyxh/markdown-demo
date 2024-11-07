import { Text } from "../node";
import { DelimiterRun } from "../parser";

/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 */
class Delimiter implements DelimiterRun {
  public readonly characters: Text[];
  public readonly delimiterChar: string;
  private readonly originalLength: number;

  // Can open emphasis, see spec.
  private readonly canOpen: boolean;

  // Can close emphasis, see spec.
  private readonly canClose: boolean;

  public previous: Delimiter | null = null;
  public next: Delimiter | null = null;

  public constructor(
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

  public getCanOpen(): boolean {
    return this.canOpen;
  }

  public getCanClose(): boolean {
    return this.canClose;
  }

  public length(): number {
    return this.characters.length;
  }

  public getOriginalLength(): number {
    return this.originalLength;
  }

  public getOpener(): Text {
    return this.characters[this.characters.length - 1];
  }

  public getCloser(): Text {
    return this.characters[0];
  }

  public getOpeners(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + length
      );
    }

    return this.characters.slice(
      this.characters.length - length,
      this.characters.length
    );
  }

  public getClosers(length: number): Text[] {
    if (!(length >= 1 && length <= this.length())) {
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + length
      );
    }

    return this.characters.slice(0, length);
  }
}

export default Delimiter;

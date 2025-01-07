import type { SourceSpan } from "@/node";
import type { CharMatcher } from "@/text";

import { Character, fromCodePoint } from "@/helpers/index";

import SourceLine from "./SourceLine";
import SourceLines from "./SourceLines";
import Position from "./Position";

class Scanner {
  /**
   * Character representing the end of input source (or outside of the text in case of the "previous" methods).
   * <p>
   * Note that we can use NULL to represent this because CommonMark does not allow those in the input (we replace them
   * in the beginning of parsing).
   */
  public static readonly END = fromCodePoint(0);

  // Lines without newlines at the end. The scanner will yield `\n` between lines because they're significant for
  // parsing and the final output. There is no `\n` after the last line.
  private readonly lines: SourceLine[];
  // Which line we're at.
  private lineIndex: number;
  // The index within the line. If index == length(), we pretend that there's a `\n` and only advance after we yield
  // that.
  private index: number;

  // Current line or "" if at the end of the lines (using "" instead of null saves a null check)
  private line: SourceLine = SourceLine.of("", null);
  private lineLength: number = 0;

  protected constructor(lines: SourceLine[], lineIndex: number, index: number) {
    this.lines = lines;
    this.lineIndex = lineIndex;
    this.index = index;

    if (lines.length !== 0) {
      this.checkPosition(lineIndex, index);
      this.setLine(lines[lineIndex]);
    }
  }

  public static of(lines: SourceLines): Scanner {
    return new Scanner(lines.getLines(), 0, 0);
  }

  public peek(): string {
    if (this.index < this.lineLength) {
      return this.line.getContent().charAt(this.index);
    } else {
      if (this.lineIndex < this.lines.length - 1) {
        return "\n";
      } else {
        // Don't return newline for end of last line
        return Scanner.END;
      }
    }
  }

  public peekCodePoint(): number {
    if (this.index < this.lineLength) {
      const c = this.line.getContent().charAt(this.index);

      if (
        Character.isHighSurrogate(c.charCodeAt(0)) &&
        this.index + 1 < this.lineLength
      ) {
        const low = this.line.getContent().charAt(this.index + 1);

        if (Character.isLowSurrogate(low.charCodeAt(0))) {
          return Character.toCodePoint(c.charCodeAt(0), low.charCodeAt(0));
        }
      }

      return c.charCodeAt(0);
    } else {
      if (this.lineIndex < this.lines.length - 1) {
        return "\n".charCodeAt(0);
      } else {
        // Don't return newline for end of last line
        return Scanner.END.charCodeAt(0);
      }
    }
  }

  public peekPreviousCodePoint(): number {
    if (this.index > 0) {
      const prev = this.index - 1;

      const c = this.line.getContent().charAt(prev);
      if (Character.isLowSurrogate(c.charCodeAt(0)) && prev > 0) {
        const high = this.line.getContent().charAt(prev - 1);

        if (Character.isHighSurrogate(high.charCodeAt(0))) {
          return Character.toCodePoint(high.charCodeAt(0), c.charCodeAt(0));
        }
      }

      return c.charCodeAt(0);
    } else {
      if (this.lineIndex > 0) {
        return "\n".charCodeAt(0);
      } else {
        return Scanner.END.charCodeAt(0);
      }
    }
  }

  public hasNext(): boolean {
    if (this.index < this.lineLength) {
      return true;
    } else {
      // No newline at end of last line
      return this.lineIndex < this.lines.length - 1;
    }
  }

  /**
   * Check if we have the specified content on the line and advanced the position. Note that if you want to match
   * newline characters, use {@link #next(char)}.
   *
   * @param content the text content to match on a single line (excluding newline characters)
   * @return true if matched and position was advanced, false otherwise
   */
  public next(content?: string): boolean {
    if (typeof content === "undefined") {
      this.index++;

      if (this.index > this.lineLength) {
        this.lineIndex++;
        if (this.lineIndex < this.lines.length) {
          this.setLine(this.lines[this.lineIndex]);
        } else {
          this.setLine(SourceLine.of("", null));
        }

        this.index = 0;
      }

      return true;
    } else {
      if (
        this.index < this.lineLength &&
        this.index + content.length <= this.lineLength
      ) {
        // Can't use startsWith because it's not available on CharSequence
        for (let i = 0; i < content.length; i++) {
          if (
            this.line.getContent().charAt(this.index + i) !== content.charAt(i)
          ) {
            return false;
          }
        }

        this.index += content.length;

        return true;
      } else {
        return false;
      }
    }
  }

  public matchMultiple(c: string): number {
    let count = 0;

    while (this.peek() === c) {
      count++;
      this.next();
    }

    return count;
  }

  public match(matcher: CharMatcher): number {
    let count = 0;

    while (matcher.matches(this.peek())) {
      count++;
      this.next();
    }

    return count;
  }

  public whitespace(): number {
    let count = 0;
    while (true) {
      switch (this.peek()) {
        case " ":
        case "\t":
        case "\n":
        case "\u000B":
        case "\f":
        case "\r":
          count++;
          this.next();

          break;

        default:
          return count;
      }
    }
  }

  public find(c: string | CharMatcher): number {
    if (typeof c === "string") {
      let count = 0;
      while (true) {
        const cur = this.peek();

        if (cur == Scanner.END) {
          return -1;
        } else if (cur == c) {
          return count;
        }

        count++;
        this.next();
      }
    } else {
      let count = 0;

      while (true) {
        const cur = this.peek();
        if (cur == Scanner.END) {
          return -1;
        } else if (c.matches(cur)) {
          return count;
        }

        count++;

        this.next();
      }
    }
  }

  // Don't expose the int index, because it would be good if we could switch input to a List<String> of lines later
  // instead of one contiguous String.
  public position(): Position {
    return new Position(this.lineIndex, this.index);
  }

  public setPosition(position: Position) {
    this.checkPosition(position.lineIndex, position.index);

    this.lineIndex = position.lineIndex;
    this.index = position.index;

    this.setLine(this.lines[this.lineIndex]);
  }

  // For cases where the caller appends the result to a StringBuilder, we could offer another method to avoid some
  // unnecessary copying.
  public getSource(begin: Position, end: Position): SourceLines {
    if (begin.lineIndex === end.lineIndex) {
      // Shortcut for common case of text from a single line
      const line: SourceLine = this.lines[begin.lineIndex];
      const newContent = line.getContent().substring(begin.index, end.index);
      let newSourceSpan: SourceSpan | null = null;
      const sourceSpan = line.getSourceSpan();

      if (sourceSpan !== null) {
        newSourceSpan = sourceSpan.subSpan(begin.index, end.index);
      }

      return SourceLines.of([SourceLine.of(newContent, newSourceSpan)]);
    } else {
      let sourceLines: SourceLines = SourceLines.empty();

      const firstLine: SourceLine = this.lines[begin.lineIndex];
      sourceLines.addLine(
        firstLine.substring(begin.index, firstLine.getContent().length)
      );

      // Lines between begin and end (we are appending the full line)
      for (let line = begin.lineIndex + 1; line < end.lineIndex; line++) {
        sourceLines.addLine(this.lines[line]);
      }

      let lastLine: SourceLine = this.lines[end.lineIndex];
      sourceLines.addLine(lastLine.substring(0, end.index));

      return sourceLines;
    }
  }

  private setLine(line: SourceLine) {
    this.line = line;
    this.lineLength = line.getContent().length;
  }

  private checkPosition(lineIndex: number, index: number) {
    if (lineIndex < 0 || lineIndex >= this.lines.length) {
      throw new Error(
        "Line index " +
          lineIndex +
          " out of range, number of lines: " +
          this.lines.length
      );
    }

    const line: SourceLine = this.lines[lineIndex];
    if (index < 0 || index > line.getContent().length) {
      throw Error(
        "Index " +
          index +
          " out of range, line length: " +
          line.getContent().length
      );
    }
  }
}

export default Scanner;

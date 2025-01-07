import type { SourceSpan } from "@/node";

import type SourceLine from "./SourceLine";

import { Appendable } from "@/helpers/index";

/**
 * A set of lines ({@link SourceLine}) from the input source.
 *
 * @since 0.16.0
 */
class SourceLines {
  private readonly lines: SourceLine[] = [];

  public static empty(): SourceLines {
    return new SourceLines();
  }

  public static of(sourceLines: SourceLine[]): SourceLines {
    const result = new SourceLines();
    result.lines.push(...sourceLines);

    return result;
  }

  public addLine(sourceLine: SourceLine) {
    this.lines.push(sourceLine);
  }

  public getLines(): SourceLine[] {
    return this.lines;
  }

  public isEmpty(): boolean {
    return this.lines.length === 0;
  }

  public getContent(): string {
    const sb = new Appendable();

    for (let i = 0; i < this.lines.length; i++) {
      if (i !== 0) {
        sb.append("\n");
      }

      sb.append(this.lines[i].getContent());
    }

    return sb.toString();
  }

  public getSourceSpans(): SourceSpan[] {
    const sourceSpans: SourceSpan[] = [];

    for (const line of this.lines) {
      const sourceSpan = line.getSourceSpan();

      if (sourceSpan !== null) {
        sourceSpans.push(sourceSpan);
      }
    }

    return sourceSpans;
  }
}

export default SourceLines;

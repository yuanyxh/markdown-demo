import type { SourceSpan } from '@/node';

import type SourceLine from './SourceLine';

import { Appendable } from '@helpers/index';

/**
 * A set of lines ({@link SourceLine}) from the input source.
 *
 * @since 0.16.0
 */
class SourceLines {
  private readonly lines: SourceLine[] = [];

  static empty(): SourceLines {
    return new SourceLines();
  }

  static of(sourceLines: SourceLine[]): SourceLines {
    const result = new SourceLines();
    result.lines.push(...sourceLines);

    return result;
  }

  addLine(sourceLine: SourceLine) {
    this.lines.push(sourceLine);
  }

  getLines(): SourceLine[] {
    return this.lines;
  }

  isEmpty(): boolean {
    return this.lines.length === 0;
  }

  getContent(): string {
    const sb = new Appendable();

    for (let i = 0; i < this.lines.length; i++) {
      if (i !== 0) {
        sb.append('\n');
      }

      sb.append(this.lines[i].getContent());
    }

    return sb.toString();
  }

  getSourceSpans(): SourceSpan[] {
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

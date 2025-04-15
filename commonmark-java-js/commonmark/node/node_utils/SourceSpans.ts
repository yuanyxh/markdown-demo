import type Node from '../abstracts/Node';

import SourceSpan from './SourceSpan';

/**
 * A list of source spans that can be added to. Takes care of merging adjacent source spans.
 *
 * @since 0.16.0
 */
class SourceSpans {
  private sourceSpans: SourceSpan[] | null = null;

  public getSourceSpans(): SourceSpan[] {
    return this.sourceSpans ? this.sourceSpans : [];
  }

  public addAllFrom(nodes: Node[]): void {
    for (const node of nodes) {
      this.addAll(node.getSourceSpans());
    }
  }

  public addAll(other: SourceSpan[]) {
    if (other.length === 0) {
      return;
    }

    if (!this.sourceSpans) {
      this.sourceSpans = [];
    }

    if (this.sourceSpans.length === 0) {
      this.sourceSpans.push(...other);
    } else {
      const lastIndex = this.sourceSpans.length - 1;
      const a = this.sourceSpans[lastIndex];
      const b = other[0];
      if (a.getInputIndex() + a.getLength() === b.getInputIndex()) {
        this.sourceSpans[lastIndex] = SourceSpan.of(
          a.getLineIndex(),
          a.getColumnIndex(),
          a.getInputIndex(),
          a.getLength() + b.getLength()
        );

        this.sourceSpans.push(...other.slice(1, other.length));
      } else {
        this.sourceSpans.push(...other);
      }
    }
  }

  public static empty(): SourceSpans {
    return new SourceSpans();
  }
}

export default SourceSpans;

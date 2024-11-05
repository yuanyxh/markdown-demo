/**
 * A list of source spans that can be added to. Takes care of merging adjacent source spans.
 *
 * @since 0.16.0
 */
class SourceSpans extends JavaObject {
  private sourceSpans: java.util.List<SourceSpan> | null;

  public static empty(): SourceSpans | null {
    return new SourceSpans();
  }

  public getSourceSpans(): java.util.List<SourceSpan> | null {
    return this.sourceSpans !== null ? this.sourceSpans : java.util.List.of();
  }

  public addAllFrom(nodes: java.lang.Iterable<Node> | null): void {
    for (let node of nodes) {
      this.addAll(node.getSourceSpans());
    }
  }

  public addAll(other: java.util.List<SourceSpan> | null): void {
    if (other.isEmpty()) {
      return;
    }

    if (this.sourceSpans === null) {
      this.sourceSpans = new java.util.ArrayList();
    }

    if (this.sourceSpans.isEmpty()) {
      this.sourceSpans.addAll(other);
    } else {
      let lastIndex: int = this.sourceSpans.size() - 1;
      let a: SourceSpan = this.sourceSpans.get(lastIndex);
      let b: SourceSpan = other.get(0);
      if (a.getInputIndex() + a.getLength() === b.getInputIndex()) {
        this.sourceSpans.set(
          lastIndex,
          SourceSpan.of(
            a.getLineIndex(),
            a.getColumnIndex(),
            a.getInputIndex(),
            a.getLength() + b.getLength()
          )
        );
        this.sourceSpans.addAll(other.subList(1, other.size()));
      } else {
        this.sourceSpans.addAll(other);
      }
    }
  }
}

export default SourceSpans;

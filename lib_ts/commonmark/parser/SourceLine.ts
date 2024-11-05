/**
 * A line or part of a line from the input source.
 *
 * @since 0.16.0
 */
class SourceLine {
  private readonly content: string;
  private readonly sourceSpan: SourceSpan;

  public static of(content: string, sourceSpan: SourceSpan): SourceLine {
    return new SourceLine(content, sourceSpan);
  }

  private constructor(content: string, sourceSpan: SourceSpan | null) {
    this.content = content;
    this.sourceSpan = sourceSpan;
  }

  public getContent(): string {
    return this.content;
  }

  public getSourceSpan(): SourceSpan {
    return this.sourceSpan;
  }

  public substring(beginIndex: number, endIndex: number): SourceLine {
    const newContent = this.content.substring(beginIndex, endIndex);

    let newSourceSpan: SourceSpan;
    if (this.sourceSpan !== null) {
      const length = endIndex - beginIndex;

      if (length !== 0) {
        const columnIndex = this.sourceSpan.getColumnIndex() + beginIndex;
        const inputIndex = this.sourceSpan.getInputIndex() + beginIndex;

        newSourceSpan = SourceSpan.of(
          this.sourceSpan.getLineIndex(),
          columnIndex,
          inputIndex,
          length
        );
      }
    }

    return SourceLine.of(newContent, newSourceSpan);
  }
}

export default SourceLine;

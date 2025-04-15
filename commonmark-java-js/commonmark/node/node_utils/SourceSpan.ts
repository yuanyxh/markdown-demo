/**
 * A source span references a snippet of text from the source input.
 * <p>
 * It has a starting position (line and column index) and a length of how many characters it spans.
 * <p>
 * For example, this CommonMark source text:
 * <pre><code>
 * &gt; foo
 * </code></pre>
 * The {@link BlockQuote} node would have this source span: line 0, column 0, length 5.
 * <p>
 * The {@link Paragraph} node inside it would have: line 0, column 2, length 3.
 * <p>
 * If a block has multiple lines, it will have a source span for each line.
 * <p>
 * Note that the column index and length are measured in Java characters (UTF-16 code units). If you're outputting them
 * to be consumed by another programming language, e.g. one that uses UTF-8 strings, you will need to translate them,
 * otherwise characters such as emojis will result in incorrect positions.
 *
 * @since 0.16.0
 */
class SourceSpan {
  private readonly lineIndex: number;
  private readonly columnIndex: number;
  private readonly inputIndex: number;
  private readonly length: number;

  private constructor(lineIndex: number, columnIndex: number, inputIndex: number, length: number) {
    if (lineIndex < 0) {
      throw new Error('lineIndex ' + lineIndex + ' must be >= 0');
    }
    if (columnIndex < 0) {
      throw new Error('columnIndex ' + columnIndex + ' must be >= 0');
    }
    if (inputIndex < 0) {
      throw new Error('inputIndex ' + inputIndex + ' must be >= 0');
    }
    if (length < 0) {
      throw new Error('length ' + length + ' must be >= 0');
    }

    this.lineIndex = lineIndex;
    this.columnIndex = columnIndex;
    this.inputIndex = inputIndex;
    this.length = length;
  }

  /**
   * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
   */
  getLineIndex(): number {
    return this.lineIndex;
  }

  /**
   * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
   * the second character, etc
   */
  getColumnIndex(): number {
    return this.columnIndex;
  }

  /**
   * @return 0-based index in whole input
   * @since 0.24.0
   */
  getInputIndex(): number {
    return this.inputIndex;
  }

  /**
   * @return length of the span in characters
   */
  getLength(): number {
    return this.length;
  }

  subSpan(beginIndex: number, endIndex: number = this.length): SourceSpan {
    if (beginIndex < 0) {
      throw Error('beginIndex ' + beginIndex + ' + must be >= 0');
    }
    if (beginIndex > this.length) {
      throw Error('beginIndex ' + beginIndex + ' must be <= length ' + this.length);
    }

    if (endIndex < 0) {
      throw Error('endIndex ' + endIndex + ' + must be >= 0');
    }
    if (endIndex > this.length) {
      throw Error('endIndex ' + endIndex + ' must be <= length ' + this.length);
    }

    if (beginIndex > endIndex) {
      throw Error('beginIndex ' + beginIndex + ' must be <= endIndex ' + endIndex);
    }

    if (beginIndex === 0 && endIndex === this.length) {
      return this;
    }

    return new SourceSpan(
      this.lineIndex,
      this.columnIndex + beginIndex,
      this.inputIndex + beginIndex,
      endIndex - beginIndex
    );
  }

  equals(o: any): boolean {
    if (this === o) {
      return true;
    }

    if (!(o instanceof SourceSpan)) {
      return false;
    }

    const that = o;

    return (
      this.lineIndex === that.lineIndex &&
      this.columnIndex === that.columnIndex &&
      this.inputIndex === that.inputIndex &&
      this.length === that.length
    );
  }

  /**
   * Use {{@link #of(int, int, int, int)}} instead to also specify input index. Using the deprecated one
   * will set {@link #inputIndex} to 0.
   */
  static of(line: number, col: number, input: number = 0, length: number): SourceSpan {
    return new SourceSpan(line, col, input, length);
  }
}

export default SourceSpan;

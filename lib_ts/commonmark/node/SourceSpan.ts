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
class SourceSpan extends JavaObject {
  private readonly lineIndex: int;
  private readonly columnIndex: int;
  private readonly inputIndex: int;
  private readonly length: int;

  /**
   * @deprecated Use {{@link #of(int, int, int, int)}} instead to also specify input index. Using the deprecated one
   * will set {@link #inputIndex} to 0.
   */
  public static of(
    lineIndex: int,
    columnIndex: int,
    length: int
  ): SourceSpan | null;

  public static of(
    line: int,
    col: int,
    input: int,
    length: int
  ): SourceSpan | null;
  public static of(...args: unknown[]): SourceSpan | null {
    switch (args.length) {
      case 3: {
        const [lineIndex, columnIndex, length] = args as [int, int, int];

        return SourceSpan.of(lineIndex, columnIndex, 0, length);

        break;
      }

      case 4: {
        const [line, col, input, length] = args as [int, int, int, int];

        return new SourceSpan(line, col, input, length);

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  private constructor(
    lineIndex: int,
    columnIndex: int,
    inputIndex: int,
    length: int
  ) {
    super();
    if (lineIndex < 0) {
      throw new java.lang.IllegalArgumentException(
        "lineIndex " + lineIndex + " must be >= 0"
      );
    }
    if (columnIndex < 0) {
      throw new java.lang.IllegalArgumentException(
        "columnIndex " + columnIndex + " must be >= 0"
      );
    }
    if (inputIndex < 0) {
      throw new java.lang.IllegalArgumentException(
        "inputIndex " + inputIndex + " must be >= 0"
      );
    }
    if (length < 0) {
      throw new java.lang.IllegalArgumentException(
        "length " + length + " must be >= 0"
      );
    }
    this.lineIndex = lineIndex;
    this.columnIndex = columnIndex;
    this.inputIndex = inputIndex;
    this.length = length;
  }

  /**
   * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
   */
  public getLineIndex(): int {
    return this.lineIndex;
  }

  /**
   * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
   * the second character, etc
   */
  public getColumnIndex(): int {
    return this.columnIndex;
  }

  /**
   * @return 0-based index in whole input
   * @since 0.24.0
   */
  public getInputIndex(): int {
    return this.inputIndex;
  }

  /**
   * @return length of the span in characters
   */
  public getLength(): int {
    return this.length;
  }

  public subSpan(beginIndex: int): SourceSpan | null;

  public subSpan(beginIndex: int, endIndex: int): SourceSpan | null;
  public subSpan(...args: unknown[]): SourceSpan | null {
    switch (args.length) {
      case 1: {
        const [beginIndex] = args as [int];

        return this.subSpan(beginIndex, this.length);

        break;
      }

      case 2: {
        const [beginIndex, endIndex] = args as [int, int];

        if (beginIndex < 0) {
          throw new java.lang.IndexOutOfBoundsException(
            "beginIndex " + beginIndex + " + must be >= 0"
          );
        }
        if (beginIndex > this.length) {
          throw new java.lang.IndexOutOfBoundsException(
            "beginIndex " + beginIndex + " must be <= length " + this.length
          );
        }
        if (endIndex < 0) {
          throw new java.lang.IndexOutOfBoundsException(
            "endIndex " + endIndex + " + must be >= 0"
          );
        }
        if (endIndex > this.length) {
          throw new java.lang.IndexOutOfBoundsException(
            "endIndex " + endIndex + " must be <= length " + this.length
          );
        }
        if (beginIndex > endIndex) {
          throw new java.lang.IndexOutOfBoundsException(
            "beginIndex " + beginIndex + " must be <= endIndex " + endIndex
          );
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

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public override equals(o: java.lang.Object | null): boolean {
    if (this === o) {
      return true;
    }
    if (o === null || this.getClass() !== o.getClass()) {
      return false;
    }
    let that: SourceSpan = o as SourceSpan;
    return (
      this.lineIndex === that.lineIndex &&
      this.columnIndex === that.columnIndex &&
      this.inputIndex === that.inputIndex &&
      this.length === that.length
    );
  }

  public override hashCode(): int {
    return java.util.Objects.hash(
      this.lineIndex,
      this.columnIndex,
      this.inputIndex,
      this.length
    );
  }

  public override toString(): string | null {
    return (
      "SourceSpan{" +
      "line=" +
      this.lineIndex +
      ", column=" +
      this.columnIndex +
      ", input=" +
      this.inputIndex +
      ", length=" +
      this.length +
      "}"
    );
  }
}

export default SourceSpan;

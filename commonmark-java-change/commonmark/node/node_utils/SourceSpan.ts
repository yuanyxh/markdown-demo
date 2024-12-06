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
 * SourceSpan 记录在源码中的位置与长度
 * <p>
 * 它有一个起始位置（行和列索引）和它跨越的字符长度
 * <p>
 * 例如，此 CommonMark 源文本：
 * ```md
 * > foo
 * ```
 * {@link BlockQuote} 节点将具有以下源范围：第 0 行，第 0 列，长度 5
 * <p>
 * 其中的 {@link Paragraph} 节点将具有：第 0 行，第 2 列，长度 3
 * <p>
 * 如果一个块有多行，则每行都有一个源跨度
 * <p>
 * 请注意，列索引和长度以 Java 字符（UTF-16 代码单元）测量
 * 如果由另一种编程语言使用，例如如果使用 UTF-8 字符串，则需要翻译它们，否则诸如表情符号之类的字符将导致位置不正确
 *
 * @since 0.16.0
 */
class SourceSpan {
  private readonly lineIndex: number;
  private readonly columnIndex: number;
  private readonly inputIndex: number;
  private readonly length: number;

  private constructor(
    lineIndex: number,
    columnIndex: number,
    inputIndex: number,
    length: number
  ) {
    if (lineIndex < 0) {
      throw new Error("lineIndex " + lineIndex + " must be >= 0");
    }
    if (columnIndex < 0) {
      throw new Error("columnIndex " + columnIndex + " must be >= 0");
    }
    if (inputIndex < 0) {
      throw new Error("inputIndex " + inputIndex + " must be >= 0");
    }
    if (length < 0) {
      throw new Error("length " + length + " must be >= 0");
    }

    this.lineIndex = lineIndex;
    this.columnIndex = columnIndex;
    this.inputIndex = inputIndex;
    this.length = length;
  }

  /**
   * 从 0 开始的行索引，例如 0 表示第一行，1 表示第二行，依此类推
   *
   * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
   */
  public getLineIndex(): number {
    return this.lineIndex;
  }

  /**
   * 源中从 0 开始的列索引（行上的字符），例如 0 表示一行的第一个字符，1 表示
   * 第二个字符等
   *
   * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
   * the second character, etc
   */
  public getColumnIndex(): number {
    return this.columnIndex;
  }

  /**
   * 获取在源码中的索引
   *
   * @return 0-based index in whole input
   * @since 0.24.0
   */
  public getInputIndex(): number {
    return this.inputIndex;
  }

  /**
   * 获取在源码中的长度
   *
   * @return length of the span in characters
   */
  public getLength(): number {
    return this.length;
  }

  /**
   * 从 beginIndex 切割到 endIndex 并生成新的 SourceSpan
   *
   * @param beginIndex
   * @param endIndex
   * @returns
   */
  public subSpan(
    beginIndex: number,
    endIndex: number = this.length
  ): SourceSpan {
    if (beginIndex < 0) {
      throw Error("beginIndex " + beginIndex + " + must be >= 0");
    }
    if (beginIndex > this.length) {
      throw Error(
        "beginIndex " + beginIndex + " must be <= length " + this.length
      );
    }

    if (endIndex < 0) {
      throw Error("endIndex " + endIndex + " + must be >= 0");
    }
    if (endIndex > this.length) {
      throw Error("endIndex " + endIndex + " must be <= length " + this.length);
    }

    if (beginIndex > endIndex) {
      throw Error(
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
  }

  /**
   * 判断两个 SourceSpan 记录的源码信息是否相同
   *
   * @param o
   * @returns
   */
  public equals(o: any): boolean {
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
   *
   * 使用 {{@link #of(int, int, int, int)}} 来指定输入索引
   * 使用已弃用的将把 {@link #inputIndex} 设置为 0
   */
  public static of(
    line: number,
    col: number,
    input: number = 0,
    length: number
  ): SourceSpan {
    return new SourceSpan(line, col, input, length);
  }
}

export default SourceSpan;

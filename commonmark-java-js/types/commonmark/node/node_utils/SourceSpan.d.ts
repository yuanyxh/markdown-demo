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
declare class SourceSpan {
    private readonly lineIndex;
    private readonly columnIndex;
    private readonly inputIndex;
    private readonly length;
    private constructor();
    /**
     * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
     */
    getLineIndex(): number;
    /**
     * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
     * the second character, etc
     */
    getColumnIndex(): number;
    /**
     * @return 0-based index in whole input
     * @since 0.24.0
     */
    getInputIndex(): number;
    /**
     * @return length of the span in characters
     */
    getLength(): number;
    subSpan(beginIndex: number, endIndex?: number): SourceSpan;
    equals(o: any): boolean;
    /**
     * Use {{@link #of(int, int, int, int)}} instead to also specify input index. Using the deprecated one
     * will set {@link #inputIndex} to 0.
     */
    static of(line: number, col: number, input: number | undefined, length: number): SourceSpan;
}
export default SourceSpan;

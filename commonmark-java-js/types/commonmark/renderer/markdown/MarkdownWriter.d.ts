import type { Appendable } from '@helpers/index';
import type { CharMatcher } from '@/text';
/**
 * Writer for Markdown (CommonMark) text.
 */
declare class MarkdownWriter {
    private readonly buffer;
    private blockSeparator;
    private lastChar;
    private atLineStart;
    private readonly prefixes;
    private readonly tight;
    private readonly rawEscapes;
    constructor(out: Appendable);
    /**
     * Write the supplied string (raw/unescaped except if {@link #pushRawEscape} was used).
     */
    raw(s: string): void;
    /**
     * Write the supplied string with escaping.
     *
     * @param s      the string to write
     * @param escape which characters to escape
     */
    text(s: string, escape: CharMatcher): void;
    /**
     * Write a newline (line terminator).
     */
    line(): void;
    /**
     * Enqueue a block separator to be written before the next text is written. Block separators are not written
     * straight away because if there are no more blocks to write we don't want a separator (at the end of the document).
     */
    block(): void;
    /**
     * Push a prefix onto the top of the stack. All prefixes are written at the beginning of each line, until the
     * prefix is popped again.
     *
     * @param prefix the raw prefix string
     */
    pushPrefix(prefix: string): void;
    /**
     * Write a prefix.
     *
     * @param prefix the raw prefix string to write
     */
    writePrefix(prefix: string): void;
    /**
     * Remove the last prefix from the top of the stack.
     */
    popPrefix(): void;
    /**
     * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
     * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
     * within the list.
     * <p>
     * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
     * only future ones.
     */
    pushTight(tight: boolean): void;
    /**
     * Remove the last "tight" setting from the top of the stack.
     */
    popTight(): void;
    /**
     * Escape the characters matching the supplied matcher, in all text (text and raw). This might be useful to
     * extensions that add another layer of syntax, e.g. the tables extension that uses `|` to separate cells and needs
     * all `|` characters to be escaped (even in code spans).
     *
     * @param rawEscape the characters to escape in raw text
     */
    pushRawEscape(rawEscape: CharMatcher): void;
    /**
     * Remove the last raw escape from the top of the stack.
     */
    popRawEscape(): void;
    /**
     * @return the last character that was written
     */
    getLastChar(): string;
    /**
     * @return whether we're at the line start (not counting any prefixes), i.e. after a {@link #line} or {@link #block}.
     */
    isAtLineStart(): boolean;
    private write;
    private writePrefixes;
    /**
     * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
     */
    private flushBlockSeparator;
    private append;
    private isTight;
    private needsEscaping;
    private rawNeedsEscaping;
}
export default MarkdownWriter;

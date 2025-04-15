import type { Appendable } from '@helpers/index';
import LineBreakRendering from './enums/LineBreakRendering';
declare class TextContentWriter {
    private readonly buffer;
    private readonly lineBreakRendering;
    private readonly tight;
    private blockSeparator;
    private lastChar;
    constructor(out: Appendable, lineBreakRendering?: LineBreakRendering);
    whitespace(): void;
    colon(): void;
    line(): void;
    block(): void;
    resetBlock(): void;
    writeStripped(s: string): void;
    write(s: string): void;
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
    private isTight;
    /**
     * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
     */
    private flushBlockSeparator;
    private append;
}
export default TextContentWriter;

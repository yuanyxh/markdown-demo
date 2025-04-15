import type { CharMatcher } from '@/text';
import SourceLine from './SourceLine';
import SourceLines from './SourceLines';
import Position from './Position';
declare class Scanner {
    /**
     * Character representing the end of input source (or outside of the text in case of the "previous" methods).
     * <p>
     * Note that we can use NULL to represent this because CommonMark does not allow those in the input (we replace them
     * in the beginning of parsing).
     */
    static readonly END: string;
    private readonly lines;
    private lineIndex;
    private index;
    private line;
    private lineLength;
    protected constructor(lines: SourceLine[], lineIndex: number, index: number);
    static of(lines: SourceLines): Scanner;
    peek(): string;
    peekCodePoint(): number;
    peekPreviousCodePoint(): number;
    hasNext(): boolean;
    /**
     * Check if we have the specified content on the line and advanced the position. Note that if you want to match
     * newline characters, use {@link #next(char)}.
     *
     * @param content the text content to match on a single line (excluding newline characters)
     * @return true if matched and position was advanced, false otherwise
     */
    next(content?: string): boolean;
    matchMultiple(c: string): number;
    match(matcher: CharMatcher): number;
    whitespace(): number;
    find(c: string | CharMatcher): number;
    position(): Position;
    setPosition(position: Position): void;
    getSource(begin: Position, end: Position): SourceLines;
    private setLine;
    private checkPosition;
}
export default Scanner;

import type { SourceSpan } from '@/node';
import type SourceLine from './SourceLine';
/**
 * A set of lines ({@link SourceLine}) from the input source.
 *
 * @since 0.16.0
 */
declare class SourceLines {
    private readonly lines;
    static empty(): SourceLines;
    static of(sourceLines: SourceLine[]): SourceLines;
    addLine(sourceLine: SourceLine): void;
    getLines(): SourceLine[];
    isEmpty(): boolean;
    getContent(): string;
    getSourceSpans(): SourceSpan[];
}
export default SourceLines;

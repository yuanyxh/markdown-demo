import { SourceSpan } from '@/node';
/**
 * A line or part of a line from the input source.
 *
 * @since 0.16.0
 */
declare class SourceLine {
    private readonly content;
    private readonly sourceSpan;
    static of(content: string, sourceSpan: SourceSpan | null): SourceLine;
    private constructor();
    getContent(): string;
    getSourceSpan(): SourceSpan | null;
    substring(beginIndex: number, endIndex: number): SourceLine;
}
export default SourceLine;

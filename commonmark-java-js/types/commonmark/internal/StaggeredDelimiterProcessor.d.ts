import type { DelimiterProcessor, DelimiterRun } from '@/parser';
/**
 * An implementation of DelimiterProcessor that dispatches all calls to two or more other DelimiterProcessors
 * depending on the length of the delimiter run. All child DelimiterProcessors must have different minimum
 * lengths. A given delimiter run is dispatched to the child with the largest acceptable minimum length. If no
 * child is applicable, the one with the largest minimum length is chosen.
 */
declare class StaggeredDelimiterProcessor implements DelimiterProcessor {
    private readonly delim;
    private minLength;
    private processors;
    constructor(delim: string);
    getOpeningCharacter(): string;
    getClosingCharacter(): string;
    getMinLength(): number;
    add(dp: DelimiterProcessor): void;
    private findProcessor;
    process(openingRun: DelimiterRun, closingRun: DelimiterRun): number;
}
export default StaggeredDelimiterProcessor;

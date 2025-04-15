import type { DelimiterProcessor, DelimiterRun } from '@/parser';
declare abstract class EmphasisDelimiterProcessor implements DelimiterProcessor {
    private readonly delimiterChar;
    protected constructor(delimiterChar: string);
    getOpeningCharacter(): string;
    getClosingCharacter(): string;
    getMinLength(): number;
    process(openingRun: DelimiterRun, closingRun: DelimiterRun): number;
}
export default EmphasisDelimiterProcessor;

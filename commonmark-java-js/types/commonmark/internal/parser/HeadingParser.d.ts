import type { Block } from '@/node';
import type { BlockParserFactory, InlineParser, MatchedBlockParser, ParserState, SourceLine } from '@/parser';
import { AbstractBlockParser, BlockStart, SourceLines, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class HeadingParser extends AbstractBlockParser {
    private readonly block;
    private readonly content;
    constructor(level: number, content: SourceLines);
    getBlock(): Block;
    tryContinue(parserState: ParserState): BlockContinue | null;
    parseInlines(inlineParser: InlineParser): void;
    static getAtxHeading(line: SourceLine): HeadingParser | null;
    static getSetextHeadingLevel(line: string, index: number): number;
    private static isSetextHeadingRest;
    static Factory: typeof Factory;
}
export default HeadingParser;

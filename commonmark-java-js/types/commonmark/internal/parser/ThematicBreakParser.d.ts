import type { Block } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, ParserState } from '@/parser';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class ThematicBreakParser extends AbstractBlockParser {
    private readonly block;
    constructor(literal: string);
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue | null;
    static Factory: typeof Factory;
    static isThematicBreak(line: string, index: number): boolean;
}
export default ThematicBreakParser;

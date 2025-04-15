import type { Block } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, ParserState } from '@/parser';
import { BlockQuote } from '@/node';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class BlockQuoteParser extends AbstractBlockParser {
    private readonly block;
    isContainer(): boolean;
    canContain(block: Block): boolean;
    getBlock(): BlockQuote;
    tryContinue(state: ParserState): BlockContinue | null;
    static isMarker(state: ParserState, index: number): boolean;
    static Factory: typeof Factory;
}
export default BlockQuoteParser;

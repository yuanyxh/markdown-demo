import type { Block } from '@/node';
import type { BlockParserFactory, ParserState, SourceLine } from '@/parser';
import { AbstractBlockParser, BlockStart, MatchedBlockParser, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class IndentedCodeBlockParser extends AbstractBlockParser {
    private readonly block;
    private readonly lines;
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue | null;
    addLine(line: SourceLine): void;
    closeBlock(): void;
    static Factory: typeof Factory;
}
export default IndentedCodeBlockParser;

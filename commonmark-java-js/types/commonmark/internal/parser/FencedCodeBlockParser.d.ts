import type { BlockParserFactory, MatchedBlockParser, ParserState, SourceLine } from '@/parser';
import type { Block } from '@/node';
import { FencedCodeBlock } from '@/node';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class FencedCodeBlockParser extends AbstractBlockParser {
    readonly block: FencedCodeBlock;
    private readonly fenceChar;
    private readonly openingFenceLength;
    private firstLine;
    private otherLines;
    constructor(fenceChar: string, fenceLength: number, fenceIndent: number);
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue;
    addLine(line: SourceLine): void;
    closeBlock(): void;
    static Factory: typeof Factory;
    static checkOpener(line: string, index: number, indent: number): FencedCodeBlockParser | null;
    private tryClosing;
}
export default FencedCodeBlockParser;

import type { Block } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, SourceLine } from '@/parser';
import { AbstractBlockParser, BlockStart, ParserState, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class HtmlBlockParser extends AbstractBlockParser {
    private static readonly TAGNAME;
    private static readonly ATTRIBUTENAME;
    private static readonly UNQUOTEDVALUE;
    private static readonly SINGLEQUOTEDVALUE;
    private static readonly DOUBLEQUOTEDVALUE;
    private static readonly ATTRIBUTEVALUE;
    private static readonly ATTRIBUTEVALUESPEC;
    private static readonly ATTRIBUTE;
    private static readonly OPENTAG;
    private static readonly CLOSETAG;
    static readonly BLOCK_PATTERNS: (RegExp | null)[][];
    private readonly block;
    private readonly closingPattern;
    private finished;
    private content;
    constructor(closingPattern?: RegExp | null);
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue | null;
    addLine(line: SourceLine): void;
    closeBlock(): void;
    static Factory: typeof Factory;
}
export default HtmlBlockParser;

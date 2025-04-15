import type { Block, SourceSpan } from '@/node';
import type { InlineParser, ParserState, SourceLine, SourceLines } from '@/parser';
import { DefinitionMap } from '@/node';
import { AbstractBlockParser, BlockContinue } from '@/parser';
declare class ParagraphParser extends AbstractBlockParser {
    private readonly block;
    private readonly linkReferenceDefinitionParser;
    canHaveLazyContinuationLines(): boolean;
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue | null;
    addLine(line: SourceLine): void;
    addSourceSpan(sourceSpan: SourceSpan): void;
    getDefinitions(): DefinitionMap<any>[];
    closeBlock(): void;
    parseInlines(inlineParser: InlineParser): void;
    getParagraphLines(): SourceLines;
}
export default ParagraphParser;

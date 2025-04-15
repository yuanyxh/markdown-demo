import type { Block, DefinitionMap, SourceSpan } from '@/node';
import type { BlockContinue } from '@/parser';
import type SourceLine from '../parser_utils/SourceLine';
import type { BlockParser } from '../interfaces/BlockParser';
import type { InlineParser } from '../interfaces/InlineParser';
import type { ParserState } from '../interfaces/ParserState';
declare abstract class AbstractBlockParser implements BlockParser {
    getBlock(): Block;
    tryContinue(parserState: ParserState): BlockContinue | null;
    isContainer(): boolean;
    canHaveLazyContinuationLines(): boolean;
    canContain(childBlock: Block): boolean;
    addLine(line: SourceLine): void;
    addSourceSpan(sourceSpan: SourceSpan): void;
    getDefinitions(): DefinitionMap<any>[];
    closeBlock(): void;
    parseInlines(inlineParser: InlineParser): void;
}
export default AbstractBlockParser;

import type { SourceLine, ParserState } from '@/parser';
import type { Block } from '@/node';
import { Document } from '@/node';
import { AbstractBlockParser, BlockContinue } from '@/parser';
declare class DocumentBlockParser extends AbstractBlockParser {
    private readonly document;
    isContainer(): boolean;
    canContain(block: Block): boolean;
    getBlock(): Document;
    tryContinue(state: ParserState): BlockContinue;
    addLine(line: SourceLine): void;
}
export default DocumentBlockParser;

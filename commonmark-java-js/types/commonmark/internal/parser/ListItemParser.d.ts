import type { Block } from '@/node';
import type { ParserState } from '@/parser';
import { AbstractBlockParser, BlockContinue } from '@/parser';
declare class ListItemParser extends AbstractBlockParser {
    private readonly block;
    /**
     * Minimum number of columns that the content has to be indented (relative to the containing block) to be part of
     * this list item.
     */
    private contentIndent;
    private hadBlankLine;
    constructor(markerIndent: number, contentIndent: number);
    isContainer(): boolean;
    canContain(childBlock: Block): boolean;
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue | null;
}
export default ListItemParser;

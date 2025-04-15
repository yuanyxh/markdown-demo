import type { Block, ListBlock } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, ParserState } from '@/parser';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';
declare class Factory implements BlockParserFactory {
    tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}
declare class ListData {
    readonly listBlock: ListBlock;
    readonly contentColumn: number;
    constructor(listBlock: ListBlock, contentColumn: number);
}
declare class ListMarkerData {
    readonly listBlock: ListBlock;
    readonly indexAfterMarker: number;
    constructor(listBlock: ListBlock, indexAfterMarker: number);
}
declare class ListBlockParser extends AbstractBlockParser {
    private readonly block;
    private hadBlankLine;
    private linesAfterBlank;
    constructor(block: ListBlock);
    isContainer(): boolean;
    canContain(childBlock: Block): boolean;
    getBlock(): Block;
    tryContinue(state: ParserState): BlockContinue;
    /**
     * Parse a list marker and return data on the marker or null.
     */
    static parseList(line: string, markerIndex: number, markerColumn: number, inParagraph: boolean): ListData | null;
    private static parseListMarker;
    private static parseOrderedList;
    private static isSpaceTabOrEnd;
    /**
     * Returns true if the two list items are of the same type,
     * with the same delimiter and bullet character. This is used
     * in agglomerating list items into lists.
     */
    static listsMatch(a: ListBlock | null, b: ListBlock | null): boolean;
    static Factory: typeof Factory;
    static ListData: typeof ListData;
    static ListMarkerData: typeof ListMarkerData;
}
export default ListBlockParser;

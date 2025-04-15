import type { Block, Document } from '@/node';
import type { BlockParser, BlockParserFactory, DelimiterProcessor, InlineContentParserFactory, InlineParserFactory, LinkProcessor, MatchedBlockParser, ParserState } from '@/parser';
import { IncludeSourceSpans, SourceLine, SourceLines } from '@/parser';
declare class MatchedBlockParserImpl implements MatchedBlockParser {
    private readonly matchedBlockParser;
    constructor(matchedBlockParser: BlockParser);
    getMatchedBlockParser(): BlockParser;
    getParagraphLines(): SourceLines;
}
declare class OpenBlockParser {
    readonly blockParser: BlockParser;
    sourceIndex: number;
    constructor(blockParser: BlockParser, sourceIndex: number);
}
declare class DocumentParser implements ParserState {
    private static readonly CORE_FACTORY_TYPES;
    private static readonly NODES_TO_CORE_FACTORIES;
    private line;
    /**
     * Line index (0-based)
     */
    private lineIndex;
    /**
     * current index (offset) in input line (0-based)
     */
    private index;
    /**
     * current column of input line (tab causes column to go to next 4-space tab stop) (0-based)
     */
    private column;
    /**
     * if the current column is within a tab character (partially consumed tab)
     */
    private columnIsInTab;
    private nextNonSpace;
    private nextNonSpaceColumn;
    private indent;
    private blank;
    private readonly blockParserFactories;
    private readonly inlineParserFactory;
    private readonly inlineContentParserFactories;
    private readonly delimiterProcessors;
    private readonly linkProcessors;
    private readonly linkMarkers;
    private readonly includeSourceSpans;
    private readonly documentBlockParser;
    private readonly definitions;
    private readonly openBlockParsers;
    private readonly allBlockParsers;
    constructor(blockParserFactories: BlockParserFactory[], inlineParserFactory: InlineParserFactory, inlineContentParserFactories: InlineContentParserFactory[], delimiterProcessors: DelimiterProcessor[], linkProcessors: LinkProcessor[], linkMarkers: Set<string>, includeSourceSpans: IncludeSourceSpans);
    static getDefaultBlockParserTypes(): Set<typeof Block>;
    static calculateBlockParserFactories(customBlockParserFactories: BlockParserFactory[], enabledBlockTypes: Set<typeof Block>): BlockParserFactory[];
    static checkEnabledBlockTypes(enabledBlockTypes: Set<typeof Block>): void;
    /**
     * The main parsing function. Returns a parsed document AST.
     */
    parse(input: string): Document;
    getLine(): SourceLine;
    getIndex(): number;
    getNextNonSpaceIndex(): number;
    getColumn(): number;
    getIndent(): number;
    isBlank(): boolean;
    getActiveBlockParser(): BlockParser;
    /**
     * Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each
     * line of input, then finalizing the document.
     */
    private parseLine;
    private setLine;
    private findNextNonSpace;
    private setNewIndex;
    private setNewColumn;
    private advance;
    /**
     * Add line content to the active block parser. We assume it can accept lines -- that check should be done before
     * calling this.
     */
    private addLine;
    private addSourceSpans;
    private findBlockStart;
    /**
     * Walk through a block & children recursively, parsing string content into inline content where appropriate.
     */
    private processInlines;
    /**
     * Add block of type tag as a child of the tip. If the tip can't accept children, close and finalize it and try
     * its parent, and so on until we find a block that can accept children.
     */
    private addChild;
    private activateBlockParser;
    private deactivateBlockParser;
    private prepareActiveBlockParserForReplacement;
    private finalizeAndProcess;
    private closeBlockParsers;
    /**
     * Finalize a block. Close it and do any necessary postprocessing, e.g. setting the content of blocks and
     * collecting link reference definitions from paragraphs.
     */
    private finalize;
    private addDefinitionsFrom;
    /**
     * Prepares the input line replacing {@code \0}
     */
    private static prepareLine;
    static MatchedBlockParserImpl: typeof MatchedBlockParserImpl;
    static OpenBlockParser: typeof OpenBlockParser;
}
export default DocumentParser;

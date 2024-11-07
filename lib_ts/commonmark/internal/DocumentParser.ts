import Appendable from "../../common/Appendable";
import {
  Block,
  BlockQuote,
  Document,
  FencedCodeBlock,
  Heading,
  HtmlBlock,
  IndentedCodeBlock,
  ListBlock,
  Paragraph,
  SourceSpan,
  ThematicBreak,
} from "../node";
import {
  BlockParser,
  BlockParserFactory,
  DelimiterProcessor,
  IncludeSourceSpans,
  InlineContentParserFactory,
  InlineParserFactory,
  LinkProcessor,
  MatchedBlockParser,
  ParserState,
  SourceLine,
  SourceLines,
} from "../parser";
import { Characters } from "../text";
import BlockContinueImpl from "./BlockContinueImpl";
import BlockQuoteParser from "./BlockQuoteParser";
import BlockStartImpl from "./BlockStartImpl";
import Definitions from "./Definitions";
import DocumentBlockParser from "./DocumentBlockParser";
import FencedCodeBlockParser from "./FencedCodeBlockParser";
import HeadingParser from "./HeadingParser";
import HtmlBlockParser from "./HtmlBlockParser";
import IndentedCodeBlockParser from "./IndentedCodeBlockParser";
import InlineParserContextImpl from "./InlineParserContextImpl";
import ListBlockParser from "./ListBlockParser";
import ParagraphParser from "./ParagraphParser";
import ThematicBreakParser from "./ThematicBreakParser";
import Parsing from "./util/Parsing";

class MatchedBlockParserImpl implements MatchedBlockParser {
  private readonly matchedBlockParser: BlockParser;

  public constructor(matchedBlockParser: BlockParser) {
    this.matchedBlockParser = matchedBlockParser;
  }

  public getMatchedBlockParser(): BlockParser {
    return this.matchedBlockParser;
  }

  public getParagraphLines(): SourceLines {
    if (this.matchedBlockParser instanceof ParagraphParser) {
      return this.matchedBlockParser.getParagraphLines();
    }

    return SourceLines.empty();
  }
}

class OpenBlockParser {
  public readonly blockParser: BlockParser;
  public sourceIndex: number;

  public constructor(blockParser: BlockParser, sourceIndex: number) {
    this.blockParser = blockParser;
    this.sourceIndex = sourceIndex;
  }
}

class DocumentParser implements ParserState {
  private static readonly CORE_FACTORY_TYPES = new Set<typeof Block>([
    BlockQuote,
    Heading,
    FencedCodeBlock,
    HtmlBlock,
    ThematicBreak,
    ListBlock,
    IndentedCodeBlock,
  ] as unknown as (typeof Block)[]);

  private static readonly NODES_TO_CORE_FACTORIES = new Map<
    typeof Block,
    BlockParserFactory
  >([
    [BlockQuote, new BlockQuoteParser.Factory()],
    [Heading, new HeadingParser.Factory()],
    [FencedCodeBlock, new FencedCodeBlockParser.Factory()],
    [HtmlBlock, new HtmlBlockParser.Factory()],
    [ThematicBreak, new ThematicBreakParser.Factory()],
    [ListBlock, new ListBlockParser.Factory()],
    [IndentedCodeBlock, new IndentedCodeBlockParser.Factory()],
  ]);

  private line: SourceLine;

  /**
   * Line index (0-based)
   */
  private lineIndex = -1;

  /**
   * current index (offset) in input line (0-based)
   */
  private index = 0;

  /**
   * current column of input line (tab causes column to go to next 4-space tab stop) (0-based)
   */
  private column = 0;

  /**
   * if the current column is within a tab character (partially consumed tab)
   */
  private columnIsInTab: boolean;

  private nextNonSpace = 0;
  private nextNonSpaceColumn = 0;
  private indent = 0;
  private blank: boolean;

  private readonly blockParserFactories: BlockParserFactory[];
  private readonly inlineParserFactory: InlineParserFactory;
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: DelimiterProcessor[];
  private readonly linkProcessors: LinkProcessor[];
  private readonly linkMarkers: Set<string>;
  private readonly includeSourceSpans: IncludeSourceSpans;
  private readonly documentBlockParser: DocumentBlockParser;
  private readonly definitions = new Definitions();

  private readonly openBlockParsers: OpenBlockParser[] = [];
  private readonly allBlockParsers: BlockParser[] = [];

  public constructor(
    blockParserFactories: BlockParserFactory[],
    inlineParserFactory: InlineParserFactory,
    inlineContentParserFactories: InlineContentParserFactory[],
    delimiterProcessors: DelimiterProcessor[],
    linkProcessors: LinkProcessor[],
    linkMarkers: Set<string>,
    includeSourceSpans: IncludeSourceSpans
  ) {
    this.blockParserFactories = blockParserFactories;
    this.inlineParserFactory = inlineParserFactory;
    this.inlineContentParserFactories = inlineContentParserFactories;
    this.delimiterProcessors = delimiterProcessors;
    this.linkProcessors = linkProcessors;
    this.linkMarkers = linkMarkers;
    this.includeSourceSpans = includeSourceSpans;

    this.documentBlockParser = new DocumentBlockParser();
    this.activateBlockParser(new OpenBlockParser(this.documentBlockParser, 0));
  }

  public static getDefaultBlockParserTypes(): Set<typeof Block> {
    return DocumentParser.CORE_FACTORY_TYPES;
  }

  public static calculateBlockParserFactories(
    customBlockParserFactories: BlockParserFactory[],
    enabledBlockTypes: Set<typeof Block>
  ): BlockParserFactory[] {
    const list: BlockParserFactory[] = [];
    // By having the custom factories come first, extensions are able to change behavior of core syntax.
    list.push(...customBlockParserFactories);
    for (let blockType of enabledBlockTypes) {
      list.push(DocumentParser.NODES_TO_CORE_FACTORIES.get(blockType)!);
    }

    return list;
  }

  public static checkEnabledBlockTypes(enabledBlockTypes: Set<typeof Block>) {
    for (const enabledBlockType of enabledBlockTypes) {
      if (!DocumentParser.NODES_TO_CORE_FACTORIES.has(enabledBlockType)) {
        throw new Error(
          "Can't enable block type " +
            enabledBlockType +
            ", possible options are: " +
            DocumentParser.NODES_TO_CORE_FACTORIES.keys()
        );
      }
    }
  }

  /**
   * The main parsing function. Returns a parsed document AST.
   */
  public parse(input: string): Document {
    let lineStart = 0;
    let lineBreak: number;
    while ((lineBreak = Characters.findLineBreak(input, lineStart)) !== -1) {
      let line: string = input.substring(lineStart, lineBreak);
      this.parseLine(line, lineStart);
      if (
        lineBreak + 1 < input.length &&
        input.charAt(lineBreak) === "\r" &&
        input.charAt(lineBreak + 1) === "\n"
      ) {
        lineStart = lineBreak + 2;
      } else {
        lineStart = lineBreak + 1;
      }
    }

    if (input !== "" && (lineStart === 0 || lineStart < input.length)) {
      let line: string = input.substring(lineStart);
      this.parseLine(line, lineStart);
    }

    return this.finalizeAndProcess();
  }

  public getLine(): SourceLine {
    return this.line;
  }

  public getIndex(): number {
    return this.index;
  }

  public getNextNonSpaceIndex(): number {
    return this.nextNonSpace;
  }

  public getColumn(): number {
    return this.column;
  }

  public getIndent(): number {
    return this.indent;
  }

  public isBlank(): boolean {
    return this.blank;
  }

  public getActiveBlockParser(): BlockParser {
    return this.openBlockParsers[this.openBlockParsers.length - 1].blockParser;
  }

  /**
   * Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each
   * line of input, then finalizing the document.
   */
  private parseLine(ln: string, inputIndex: number) {
    this.setLine(ln, inputIndex);

    // For each containing block, try to parse the associated line start.
    // The document will always match, so we can skip the first block parser and start at 1 matches
    let matches = 1;
    for (let i = 1; i < this.openBlockParsers.length; i++) {
      const openBlockParser = this.openBlockParsers[i];
      const blockParser: BlockParser = openBlockParser.blockParser;
      this.findNextNonSpace();

      const result = blockParser.tryContinue(this);
      if (result instanceof BlockContinueImpl) {
        const blockContinue = result;
        openBlockParser.sourceIndex = this.getIndex();
        if (blockContinue.isFinalize()) {
          this.addSourceSpans();
          this.closeBlockParsers(this.openBlockParsers.length - i);

          return;
        } else {
          if (blockContinue.getNewIndex() !== -1) {
            this.setNewIndex(blockContinue.getNewIndex());
          } else if (blockContinue.getNewColumn() !== -1) {
            this.setNewColumn(blockContinue.getNewColumn());
          }

          matches++;
        }
      } else {
        break;
      }
    }

    let unmatchedBlocks = this.openBlockParsers.length - matches;
    let blockParser: BlockParser =
      this.openBlockParsers[matches - 1].blockParser;
    let startedNewBlock: boolean = false;

    let lastIndex = this.index;

    // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:
    let tryBlockStarts: boolean =
      blockParser.getBlock() instanceof Paragraph || blockParser.isContainer();

    while (tryBlockStarts) {
      lastIndex = this.index;
      this.findNextNonSpace();

      // this is a little performance optimization:
      if (
        this.isBlank() ||
        (this.indent < Parsing.CODE_BLOCK_INDENT &&
          Characters.isLetter(this.line.getContent(), this.nextNonSpace))
      ) {
        this.setNewIndex(this.nextNonSpace);
        break;
      }

      const blockStart = this.findBlockStart(blockParser);
      if (blockStart === null) {
        this.setNewIndex(this.nextNonSpace);
        break;
      }

      startedNewBlock = true;
      const sourceIndex = this.getIndex();

      // We're starting a new block. If we have any previous blocks that need to be closed, we need to do it now.
      if (unmatchedBlocks > 0) {
        this.closeBlockParsers(unmatchedBlocks);
        unmatchedBlocks = 0;
      }

      if (blockStart.getNewIndex() !== -1) {
        this.setNewIndex(blockStart.getNewIndex());
      } else if (blockStart.getNewColumn() !== -1) {
        this.setNewColumn(blockStart.getNewColumn());
      }

      let replacedSourceSpans: SourceSpan[] | null = null;
      if (blockStart.isReplaceActiveBlockParser()) {
        const replacedBlock = this.prepareActiveBlockParserForReplacement();
        replacedSourceSpans = replacedBlock.getSourceSpans();
      }

      for (let newBlockParser of blockStart.getBlockParsers()) {
        this.addChild(
          new DocumentParser.OpenBlockParser(newBlockParser, sourceIndex)
        );

        if (replacedSourceSpans !== null) {
          newBlockParser.getBlock().setSourceSpans(replacedSourceSpans);
        }

        blockParser = newBlockParser;
        tryBlockStarts = newBlockParser.isContainer();
      }
    }

    // What remains at the offset is a text line. Add the text to the
    // appropriate block.

    // First check for a lazy continuation line
    if (
      !startedNewBlock &&
      !this.isBlank() &&
      this.getActiveBlockParser().canHaveLazyContinuationLines()
    ) {
      this.openBlockParsers[this.openBlockParsers.length - 1].sourceIndex =
        lastIndex;
      // lazy paragraph continuation
      this.addLine();
    } else {
      // finalize any blocks not matched
      if (unmatchedBlocks > 0) {
        this.closeBlockParsers(unmatchedBlocks);
      }

      if (!blockParser.isContainer()) {
        this.addLine();
      } else if (!this.isBlank()) {
        // create paragraph container for line
        let paragraphParser: ParagraphParser = new ParagraphParser();
        this.addChild(
          new DocumentParser.OpenBlockParser(paragraphParser, lastIndex)
        );
        this.addLine();
      } else {
        // This can happen for a list item like this:
        // ```
        // *
        // list item
        // ```
        //
        // The first line does not start a paragraph yet, but we still want to record source positions.
        this.addSourceSpans();
      }
    }
  }

  private setLine(ln: string, inputIndex: number) {
    this.lineIndex++;
    this.index = 0;
    this.column = 0;
    this.columnIsInTab = false;

    let lineContent = DocumentParser.prepareLine(ln);
    let sourceSpan: SourceSpan | null = null;
    if (this.includeSourceSpans !== IncludeSourceSpans.NONE) {
      sourceSpan = SourceSpan.of(
        this.lineIndex,
        0,
        inputIndex,
        lineContent.length
      );
    }

    this.line = SourceLine.of(lineContent, sourceSpan);
  }

  private findNextNonSpace() {
    let i = this.index;
    let cols = this.column;

    this.blank = true;
    let length = this.line.getContent().length;

    while (i < length) {
      const c = this.line.getContent().charAt(i);

      switch (c) {
        case " ":
          i++;
          cols++;
          continue;
        case "\t":
          i++;
          cols += 4 - (cols % 4);
          continue;

        default:
      }

      this.blank = false;
      break;
    }

    this.nextNonSpace = i;
    this.nextNonSpaceColumn = cols;
    this.indent = this.nextNonSpaceColumn - this.column;
  }

  private setNewIndex(newIndex: number): void {
    if (newIndex >= this.nextNonSpace) {
      // We can start from here, no need to calculate tab stops again
      this.index = this.nextNonSpace;
      this.column = this.nextNonSpaceColumn;
    }
    let length = this.line.getContent().length;

    while (this.index < newIndex && this.index !== length) {
      this.advance();
    }

    // If we're going to an index as opposed to a column, we're never within a tab
    this.columnIsInTab = false;
  }

  private setNewColumn(newColumn: number): void {
    if (newColumn >= this.nextNonSpaceColumn) {
      // We can start from here, no need to calculate tab stops again
      this.index = this.nextNonSpace;
      this.column = this.nextNonSpaceColumn;
    }

    let length = this.line.getContent().length;

    while (this.column < newColumn && this.index !== length) {
      this.advance();
    }

    if (this.column > newColumn) {
      // Last character was a tab and we overshot our target
      this.index--;
      this.column = newColumn;
      this.columnIsInTab = true;
    } else {
      this.columnIsInTab = false;
    }
  }

  private advance() {
    const c = this.line.getContent().charAt(this.index);
    this.index++;
    if (c === "\t") {
      this.column += Parsing.columnsToNextTabStop(this.column);
    } else {
      this.column++;
    }
  }

  /**
   * Add line content to the active block parser. We assume it can accept lines -- that check should be done before
   * calling this.
   */
  private addLine() {
    let content: string;

    if (this.columnIsInTab) {
      // Our column is in a partially consumed tab. Expand the remaining columns (to the next tab stop) to spaces.
      const afterTab = this.index + 1;
      const rest = this.line
        .getContent()
        .substring(afterTab, this.line.getContent().length);
      const spaces = Parsing.columnsToNextTabStop(this.column);
      const sb = new Appendable();

      for (let i = 0; i < spaces; i++) {
        sb.append(" ");
      }

      sb.append(rest);
      content = sb.toString();
    } else if (this.index === 0) {
      content = this.line.getContent();
    } else {
      content = this.line
        .getContent()
        .substring(this.index, this.line.getContent().length);
    }

    let sourceSpan!: SourceSpan;
    if (
      this.includeSourceSpans === IncludeSourceSpans.BLOCKS_AND_INLINES &&
      this.index < this.line.getSourceSpan()!.getLength()
    ) {
      // Note that if we're in a partially-consumed tab the length of the source span and the content don't match.
      sourceSpan = this.line.getSourceSpan()!.subSpan(this.index);
    }

    this.getActiveBlockParser().addLine(SourceLine.of(content, sourceSpan));
    this.addSourceSpans();
  }

  private addSourceSpans() {
    if (this.includeSourceSpans !== IncludeSourceSpans.NONE) {
      // Don't add source spans for Document itself (it would get the whole source text), so start at 1, not 0
      for (let i = 1; i < this.openBlockParsers.length; i++) {
        const openBlockParser = this.openBlockParsers[i];
        // In case of a lazy continuation line, the index is less than where the block parser would expect the
        // contents to start, so let's use whichever is smaller.
        const blockIndex = Math.min(openBlockParser.sourceIndex, this.index);
        const length = this.line.getContent().length - blockIndex;

        if (length !== 0) {
          openBlockParser.blockParser.addSourceSpan(
            this.line.getSourceSpan()!.subSpan(blockIndex)
          );
        }
      }
    }
  }

  private findBlockStart(blockParser: BlockParser): BlockStartImpl | null {
    const matchedBlockParser: MatchedBlockParser =
      new DocumentParser.MatchedBlockParserImpl(blockParser);
    for (const blockParserFactory of this.blockParserFactories) {
      const result = blockParserFactory.tryStart(this, matchedBlockParser);

      if (result instanceof BlockStartImpl) {
        return result;
      }
    }

    return null;
  }

  /**
   * Walk through a block & children recursively, parsing string content into inline content where appropriate.
   */
  private processInlines(): void {
    const context = new InlineParserContextImpl(
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      this.definitions
    );
    const inlineParser = this.inlineParserFactory.create(context);

    for (const blockParser of this.allBlockParsers) {
      blockParser.parseInlines(inlineParser);
    }
  }

  /**
   * Add block of type tag as a child of the tip. If the tip can't accept children, close and finalize it and try
   * its parent, and so on until we find a block that can accept children.
   */
  private addChild(openBlockParser: OpenBlockParser) {
    while (
      !this.getActiveBlockParser().canContain(
        openBlockParser.blockParser.getBlock()
      )
    ) {
      this.closeBlockParsers(1);
    }

    this.getActiveBlockParser()
      .getBlock()
      .appendChild(openBlockParser.blockParser.getBlock());
    this.activateBlockParser(openBlockParser);
  }

  private activateBlockParser(openBlockParser: OpenBlockParser) {
    this.openBlockParsers.push(openBlockParser);
  }

  private deactivateBlockParser(): OpenBlockParser {
    return this.openBlockParsers.splice(this.openBlockParsers.length - 1, 1)[0];
  }

  private prepareActiveBlockParserForReplacement(): Block {
    // Note that we don't want to parse inlines, as it's getting replaced.
    const old: BlockParser = this.deactivateBlockParser().blockParser;

    if (old instanceof ParagraphParser) {
      let paragraphParser: ParagraphParser = old as ParagraphParser;
      // Collect any link reference definitions. Note that replacing the active block parser is done after a
      // block parser got the current paragraph content using MatchedBlockParser#getContentString. In case the
      // paragraph started with link reference definitions, we parse and strip them before the block parser gets
      // the content. We want to keep them.
      // If no replacement happens, we collect the definitions as part of finalizing blocks.
      this.addDefinitionsFrom(paragraphParser);
    }

    // Do this so that source positions are calculated, which we will carry over to the replacing block.
    old.closeBlock();
    old.getBlock().unlink();
    return old.getBlock();
  }

  private finalizeAndProcess(): Document {
    this.closeBlockParsers(this.openBlockParsers.length);
    this.processInlines();

    return this.documentBlockParser.getBlock();
  }

  private closeBlockParsers(count: number): void {
    for (let i = 0; i < count; i++) {
      const blockParser = this.deactivateBlockParser().blockParser;
      this.finalize(blockParser);
      // Remember for inline parsing. Note that a lot of blocks don't need inline parsing. We could have a
      // separate interface (e.g. BlockParserWithInlines) so that we only have to remember those that actually
      // have inlines to parse.
      this.allBlockParsers.push(blockParser);
    }
  }

  /**
   * Finalize a block. Close it and do any necessary postprocessing, e.g. setting the content of blocks and
   * collecting link reference definitions from paragraphs.
   */
  private finalize(blockParser: BlockParser) {
    this.addDefinitionsFrom(blockParser);
    blockParser.closeBlock();
  }

  private addDefinitionsFrom(blockParser: BlockParser) {
    for (let definitionMap of blockParser.getDefinitions()) {
      this.definitions.addDefinitions(definitionMap);
    }
  }

  /**
   * Prepares the input line replacing {@code \0}
   */
  private static prepareLine(line: string): string {
    if (line.indexOf("\0") === -1) {
      return line;
    } else {
      return line.replace("\0", "\uFFFD");
    }
  }

  public static MatchedBlockParserImpl = MatchedBlockParserImpl;

  public static OpenBlockParser = OpenBlockParser;
}

export default DocumentParser;

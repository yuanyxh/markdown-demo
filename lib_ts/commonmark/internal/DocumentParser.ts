class DocumentParser implements ParserState {
  private static readonly CORE_FACTORY_TYPES: java.util.Set<
    java.lang.Class<Block>
  > | null = new java.util.LinkedHashSet(
    java.util.List.of(
      BlockQuote.class,
      Heading.class,
      FencedCodeBlock.class,
      HtmlBlock.class,
      ThematicBreak.class,
      ListBlock.class,
      IndentedCodeBlock.class
    )
  );

  private static readonly NODES_TO_CORE_FACTORIES: java.util.Map<
    java.lang.Class<Block>,
    BlockParserFactory
  > | null;

  static {
    let map: java.util.Map<
      java.lang.Class<Block>,
      BlockParserFactory
    > = new java.util.HashMap();
    map.put(BlockQuote.class, new BlockQuoteParser.Factory());
    map.put(Heading.class, new HeadingParser.Factory());
    map.put(FencedCodeBlock.class, new FencedCodeBlockParser.Factory());
    map.put(HtmlBlock.class, new HtmlBlockParser.Factory());
    map.put(ThematicBreak.class, new ThematicBreakParser.Factory());
    map.put(ListBlock.class, new ListBlockParser.Factory());
    map.put(IndentedCodeBlock.class, new IndentedCodeBlockParser.Factory());
    DocumentParser.NODES_TO_CORE_FACTORIES =
      java.util.Collections.unmodifiableMap(map);
  }

  private line: SourceLine | null;

  /**
   * Line index (0-based)
   */
  private lineIndex: int = -1;

  /**
   * current index (offset) in input line (0-based)
   */
  private index: int = 0;

  /**
   * current column of input line (tab causes column to go to next 4-space tab stop) (0-based)
   */
  private column: int = 0;

  /**
   * if the current column is within a tab character (partially consumed tab)
   */
  private columnIsInTab: boolean;

  private nextNonSpace: int = 0;
  private nextNonSpaceColumn: int = 0;
  private indent: int = 0;
  private blank: boolean;

  private readonly blockParserFactories: java.util.List<BlockParserFactory> | null;
  private readonly inlineParserFactory: InlineParserFactory | null;
  private readonly inlineContentParserFactories: java.util.List<InlineContentParserFactory> | null;
  private readonly delimiterProcessors: java.util.List<DelimiterProcessor> | null;
  private readonly linkProcessors: java.util.List<LinkProcessor> | null;
  private readonly linkMarkers: java.util.Set<java.lang.Character> | null;
  private readonly includeSourceSpans: IncludeSourceSpans | null;
  private readonly documentBlockParser: DocumentBlockParser | null;
  private readonly definitions: Definitions | null = new Definitions();

  private readonly openBlockParsers: java.util.List<DocumentParser.OpenBlockParser> | null =
    new java.util.ArrayList();
  private readonly allBlockParsers: java.util.List<BlockParser> | null =
    new java.util.ArrayList();

  public constructor(
    blockParserFactories: java.util.List<BlockParserFactory> | null,
    inlineParserFactory: InlineParserFactory | null,
    inlineContentParserFactories: java.util.List<InlineContentParserFactory> | null,
    delimiterProcessors: java.util.List<DelimiterProcessor> | null,
    linkProcessors: java.util.List<LinkProcessor> | null,
    linkMarkers: java.util.Set<java.lang.Character> | null,
    includeSourceSpans: IncludeSourceSpans | null
  ) {
    super();
    this.blockParserFactories = blockParserFactories;
    this.inlineParserFactory = inlineParserFactory;
    this.inlineContentParserFactories = inlineContentParserFactories;
    this.delimiterProcessors = delimiterProcessors;
    this.linkProcessors = linkProcessors;
    this.linkMarkers = linkMarkers;
    this.includeSourceSpans = includeSourceSpans;

    this.documentBlockParser = new DocumentBlockParser();
    this.activateBlockParser(
      new DocumentParser.OpenBlockParser(this.documentBlockParser, 0)
    );
  }

  public static getDefaultBlockParserTypes(): java.util.Set<
    java.lang.Class<Block>
  > | null {
    return DocumentParser.CORE_FACTORY_TYPES;
  }

  public static calculateBlockParserFactories(
    customBlockParserFactories: java.util.List<BlockParserFactory> | null,
    enabledBlockTypes: java.util.Set<java.lang.Class<Block>> | null
  ): java.util.List<BlockParserFactory> | null {
    let list: java.util.List<BlockParserFactory> = new java.util.ArrayList();
    // By having the custom factories come first, extensions are able to change behavior of core syntax.
    list.addAll(customBlockParserFactories);
    for (let blockType of enabledBlockTypes) {
      list.add(DocumentParser.NODES_TO_CORE_FACTORIES.get(blockType));
    }
    return list;
  }

  public static checkEnabledBlockTypes(
    enabledBlockTypes: java.util.Set<java.lang.Class<Block>> | null
  ): void {
    for (let enabledBlockType of enabledBlockTypes) {
      if (
        !DocumentParser.NODES_TO_CORE_FACTORIES.containsKey(enabledBlockType)
      ) {
        throw new java.lang.IllegalArgumentException(
          "Can't enable block type " +
            enabledBlockType +
            ", possible options are: " +
            DocumentParser.NODES_TO_CORE_FACTORIES.keySet()
        );
      }
    }
  }

  /**
   * The main parsing function. Returns a parsed document AST.
   */
  public parse(input: string | null): Document | null;

  public parse(input: java.io.Reader | null): Document | null;
  public parse(...args: unknown[]): Document | null {
    switch (args.length) {
      case 1: {
        const [input] = args as [string];

        let lineStart: int = 0;
        let lineBreak: int;
        while (
          (lineBreak = Characters.findLineBreak(input, lineStart)) !== -1
        ) {
          let line: string = input.substring(lineStart, lineBreak);
          this.parseLine(line, lineStart);
          if (
            lineBreak + 1 < input.length() &&
            input.charAt(lineBreak) === "\r" &&
            input.charAt(lineBreak + 1) === "\n"
          ) {
            lineStart = lineBreak + 2;
          } else {
            lineStart = lineBreak + 1;
          }
        }
        if (
          !input.isEmpty() &&
          (lineStart === 0 || lineStart < input.length())
        ) {
          let line: string = input.substring(lineStart);
          this.parseLine(line, lineStart);
        }

        return this.finalizeAndProcess();

        break;
      }

      case 1: {
        const [input] = args as [java.io.Reader];

        let lineReader = new LineReader(input);
        let inputIndex: int = 0;
        let line: string;
        while ((line = lineReader.readLine()) !== null) {
          this.parseLine(line, inputIndex);
          inputIndex += line.length();
          let eol = lineReader.getLineTerminator();
          if (eol !== null) {
            inputIndex += eol.length();
          }
        }

        return this.finalizeAndProcess();

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public getLine(): SourceLine | null {
    return this.line;
  }

  public getIndex(): int {
    return this.index;
  }

  public getNextNonSpaceIndex(): int {
    return this.nextNonSpace;
  }

  public getColumn(): int {
    return this.column;
  }

  public getIndent(): int {
    return this.indent;
  }

  public isBlank(): boolean {
    return this.blank;
  }

  public getActiveBlockParser(): BlockParser | null {
    return this.openBlockParsers.get(this.openBlockParsers.size() - 1)
      .blockParser;
  }

  /**
   * Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each
   * line of input, then finalizing the document.
   */
  private parseLine(ln: string | null, inputIndex: int): void {
    this.setLine(ln, inputIndex);

    // For each containing block, try to parse the associated line start.
    // The document will always match, so we can skip the first block parser and start at 1 matches
    let matches: int = 1;
    for (let i: int = 1; i < this.openBlockParsers.size(); i++) {
      let openBlockParser: DocumentParser.OpenBlockParser =
        this.openBlockParsers.get(i);
      let blockParser: BlockParser = openBlockParser.blockParser;
      this.findNextNonSpace();

      let result: BlockContinue = blockParser.tryContinue(this);
      if (result instanceof BlockContinueImpl) {
        let blockContinue: BlockContinueImpl = result as BlockContinueImpl;
        openBlockParser.sourceIndex = this.getIndex();
        if (blockContinue.isFinalize()) {
          this.addSourceSpans();
          this.closeBlockParsers(this.openBlockParsers.size() - i);
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

    let unmatchedBlocks: int = this.openBlockParsers.size() - matches;
    let blockParser: BlockParser = this.openBlockParsers.get(
      matches - 1
    ).blockParser;
    let startedNewBlock: boolean = false;

    let lastIndex: int = this.index;

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

      let blockStart: BlockStartImpl = this.findBlockStart(blockParser);
      if (blockStart === null) {
        this.setNewIndex(this.nextNonSpace);
        break;
      }

      startedNewBlock = true;
      let sourceIndex: int = this.getIndex();

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

      let replacedSourceSpans: java.util.List<SourceSpan> = null;
      if (blockStart.isReplaceActiveBlockParser()) {
        let replacedBlock: Block =
          this.prepareActiveBlockParserForReplacement();
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
      this.openBlockParsers.get(this.openBlockParsers.size() - 1).sourceIndex =
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

  private setLine(ln: string | null, inputIndex: int): void {
    this.lineIndex++;
    this.index = 0;
    this.column = 0;
    this.columnIsInTab = false;

    let lineContent: string = DocumentParser.prepareLine(ln);
    let sourceSpan: SourceSpan = null;
    if (this.includeSourceSpans !== IncludeSourceSpans.NONE) {
      sourceSpan = SourceSpan.of(
        this.lineIndex,
        0,
        inputIndex,
        lineContent.length()
      );
    }
    this.line = SourceLine.of(lineContent, sourceSpan);
  }

  private findNextNonSpace(): void {
    let i: int = this.index;
    let cols: int = this.column;

    this.blank = true;
    let length: int = this.line.getContent().length();
    while (i < length) {
      let c: char = this.line.getContent().charAt(i);
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

  private setNewIndex(newIndex: int): void {
    if (newIndex >= this.nextNonSpace) {
      // We can start from here, no need to calculate tab stops again
      this.index = this.nextNonSpace;
      this.column = this.nextNonSpaceColumn;
    }
    let length: int = this.line.getContent().length();
    while (this.index < newIndex && this.index !== length) {
      this.advance();
    }
    // If we're going to an index as opposed to a column, we're never within a tab
    this.columnIsInTab = false;
  }

  private setNewColumn(newColumn: int): void {
    if (newColumn >= this.nextNonSpaceColumn) {
      // We can start from here, no need to calculate tab stops again
      this.index = this.nextNonSpace;
      this.column = this.nextNonSpaceColumn;
    }
    let length: int = this.line.getContent().length();
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

  private advance(): void {
    let c: char = this.line.getContent().charAt(this.index);
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
  private addLine(): void {
    let content: java.lang.CharSequence;
    if (this.columnIsInTab) {
      // Our column is in a partially consumed tab. Expand the remaining columns (to the next tab stop) to spaces.
      let afterTab: int = this.index + 1;
      let rest: java.lang.CharSequence = this.line
        .getContent()
        .subSequence(afterTab, this.line.getContent().length());
      let spaces: int = Parsing.columnsToNextTabStop(this.column);
      let sb: stringBuilder = new stringBuilder(spaces + rest.length());
      for (let i: int = 0; i < spaces; i++) {
        sb.append(" ");
      }
      sb.append(rest);
      content = sb.toString();
    } else if (this.index === 0) {
      content = this.line.getContent();
    } else {
      content = this.line
        .getContent()
        .subSequence(this.index, this.line.getContent().length());
    }
    let sourceSpan: SourceSpan = null;
    if (
      this.includeSourceSpans === IncludeSourceSpans.BLOCKS_AND_INLINES &&
      this.index < this.line.getSourceSpan().getLength()
    ) {
      // Note that if we're in a partially-consumed tab the length of the source span and the content don't match.
      sourceSpan = this.line.getSourceSpan().subSpan(this.index);
    }
    this.getActiveBlockParser().addLine(SourceLine.of(content, sourceSpan));
    this.addSourceSpans();
  }

  private addSourceSpans(): void {
    if (this.includeSourceSpans !== IncludeSourceSpans.NONE) {
      // Don't add source spans for Document itself (it would get the whole source text), so start at 1, not 0
      for (let i: int = 1; i < this.openBlockParsers.size(); i++) {
        let openBlockParser = this.openBlockParsers.get(i);
        // In case of a lazy continuation line, the index is less than where the block parser would expect the
        // contents to start, so let's use whichever is smaller.
        let blockIndex: int = java.lang.Math.min(
          openBlockParser.sourceIndex,
          this.index
        );
        let length: int = this.line.getContent().length() - blockIndex;
        if (length !== 0) {
          openBlockParser.blockParser.addSourceSpan(
            this.line.getSourceSpan().subSpan(blockIndex)
          );
        }
      }
    }
  }

  private findBlockStart(
    blockParser: BlockParser | null
  ): BlockStartImpl | null {
    let matchedBlockParser: MatchedBlockParser =
      new DocumentParser.MatchedBlockParserImpl(blockParser);
    for (let blockParserFactory of this.blockParserFactories) {
      let result: BlockStart = blockParserFactory.tryStart(
        this,
        matchedBlockParser
      );
      if (result instanceof BlockStartImpl) {
        return result as BlockStartImpl;
      }
    }
    return null;
  }

  /**
   * Walk through a block & children recursively, parsing string content into inline content where appropriate.
   */
  private processInlines(): void {
    let context = new InlineParserContextImpl(
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      this.definitions
    );
    let inlineParser = this.inlineParserFactory.create(context);

    for (let blockParser of this.allBlockParsers) {
      blockParser.parseInlines(inlineParser);
    }
  }

  /**
   * Add block of type tag as a child of the tip. If the tip can't accept children, close and finalize it and try
   * its parent, and so on until we find a block that can accept children.
   */
  private addChild(
    openBlockParser: DocumentParser.OpenBlockParser | null
  ): void {
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

  private activateBlockParser(
    openBlockParser: DocumentParser.OpenBlockParser | null
  ): void {
    this.openBlockParsers.add(openBlockParser);
  }

  private deactivateBlockParser(): DocumentParser.OpenBlockParser | null {
    return this.openBlockParsers.remove(this.openBlockParsers.size() - 1);
  }

  private prepareActiveBlockParserForReplacement(): Block | null {
    // Note that we don't want to parse inlines, as it's getting replaced.
    let old: BlockParser = this.deactivateBlockParser().blockParser;

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

  private finalizeAndProcess(): Document | null {
    this.closeBlockParsers(this.openBlockParsers.size());
    this.processInlines();
    return this.documentBlockParser.getBlock();
  }

  private closeBlockParsers(count: int): void {
    for (let i: int = 0; i < count; i++) {
      let blockParser: BlockParser = this.deactivateBlockParser().blockParser;
      this.finalize(blockParser);
      // Remember for inline parsing. Note that a lot of blocks don't need inline parsing. We could have a
      // separate interface (e.g. BlockParserWithInlines) so that we only have to remember those that actually
      // have inlines to parse.
      this.allBlockParsers.add(blockParser);
    }
  }

  /**
   * Finalize a block. Close it and do any necessary postprocessing, e.g. setting the content of blocks and
   * collecting link reference definitions from paragraphs.
   */
  private override finalize(blockParser: BlockParser | null): void {
    this.addDefinitionsFrom(blockParser);
    blockParser.closeBlock();
  }

  private addDefinitionsFrom(blockParser: BlockParser | null): void {
    for (let definitionMap of blockParser.getDefinitions()) {
      this.definitions.addDefinitions(definitionMap);
    }
  }

  /**
   * Prepares the input line replacing {@code \0}
   */
  private static prepareLine(line: string | null): string | null {
    if (line.indexOf("\0") === -1) {
      return line;
    } else {
      return line.replace("\0", "\uFFFD");
    }
  }

  public static MatchedBlockParserImpl = class MatchedBlockParserImpl
    implements MatchedBlockParser
  {
    private readonly matchedBlockParser: BlockParser | null;

    public constructor(matchedBlockParser: BlockParser | null) {
      super();
      this.matchedBlockParser = matchedBlockParser;
    }

    public getMatchedBlockParser(): BlockParser | null {
      return this.matchedBlockParser;
    }

    public getParagraphLines(): SourceLines | null {
      if (this.matchedBlockParser instanceof ParagraphParser) {
        let paragraphParser: ParagraphParser = this
          .matchedBlockParser as ParagraphParser;
        return paragraphParser.getParagraphLines();
      }
      return SourceLines.empty();
    }
  };

  public static OpenBlockParser = class OpenBlockParser {
    private readonly blockParser: BlockParser | null;
    private sourceIndex: int;

    protected constructor(blockParser: BlockParser | null, sourceIndex: int) {
      super();
      this.blockParser = blockParser;
      this.sourceIndex = sourceIndex;
    }
  };
}

export default DocumentParser;

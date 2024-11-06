class ParagraphParser extends AbstractBlockParser {
  private readonly block: Paragraph | null = new Paragraph();
  private readonly linkReferenceDefinitionParser: LinkReferenceDefinitionParser | null =
    new LinkReferenceDefinitionParser();

  public canHaveLazyContinuationLines(): boolean {
    return true;
  }

  public getBlock(): Block | null {
    return this.block;
  }

  public tryContinue(state: ParserState | null): BlockContinue | null {
    if (!state.isBlank()) {
      return BlockContinue.atIndex(state.getIndex());
    } else {
      return BlockContinue.none();
    }
  }

  public addLine(line: SourceLine | null): void {
    this.linkReferenceDefinitionParser.parse(line);
  }

  public addSourceSpan(sourceSpan: SourceSpan | null): void {
    // Some source spans might belong to link reference definitions, others to the paragraph.
    // The parser will handle that.
    this.linkReferenceDefinitionParser.addSourceSpan(sourceSpan);
  }

  public getDefinitions(): java.util.List<DefinitionMap<unknown>> | null {
    let map = new DefinitionMap(LinkReferenceDefinition.class);
    for (let def of this.linkReferenceDefinitionParser.getDefinitions()) {
      map.putIfAbsent(def.getLabel(), def);
    }
    return java.util.List.of(map);
  }

  public closeBlock(): void {
    for (let def of this.linkReferenceDefinitionParser.getDefinitions()) {
      this.block.insertBefore(def);
    }

    if (this.linkReferenceDefinitionParser.getParagraphLines().isEmpty()) {
      this.block.unlink();
    } else {
      this.block.setSourceSpans(
        this.linkReferenceDefinitionParser.getParagraphSourceSpans()
      );
    }
  }

  public parseInlines(inlineParser: InlineParser | null): void {
    let lines: SourceLines =
      this.linkReferenceDefinitionParser.getParagraphLines();
    if (!lines.isEmpty()) {
      inlineParser.parse(lines, this.block);
    }
  }

  public getParagraphLines(): SourceLines | null {
    return this.linkReferenceDefinitionParser.getParagraphLines();
  }
}

export default ParagraphParser;

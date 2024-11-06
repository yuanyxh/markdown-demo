class DocumentBlockParser extends AbstractBlockParser {
  private readonly document: Document | null = new Document();

  public isContainer(): boolean {
    return true;
  }

  public canContain(block: Block | null): boolean {
    return true;
  }

  public getBlock(): Document | null {
    return this.document;
  }

  public tryContinue(state: ParserState | null): BlockContinue | null {
    return BlockContinue.atIndex(state.getIndex());
  }

  public addLine(line: SourceLine | null): void {}
}

export default DocumentBlockParser;

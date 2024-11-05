export class BlockStartImpl extends BlockStart {
  private readonly blockParsers: BlockParser[] | null;
  private newIndex: int = -1;
  private newColumn: int = -1;
  private replaceActiveBlockParser: boolean = false;

  public constructor(...blockParsers: BlockParser | null[]) {
    super();
    this.blockParsers = this.blockParsers;
  }

  public getBlockParsers(): BlockParser[] | null {
    return this.blockParsers;
  }

  public getNewIndex(): int {
    return this.newIndex;
  }

  public getNewColumn(): int {
    return this.newColumn;
  }

  public isReplaceActiveBlockParser(): boolean {
    return this.replaceActiveBlockParser;
  }

  public atIndex(newIndex: int): BlockStart | null {
    this.newIndex = newIndex;
    return this;
  }

  public atColumn(newColumn: int): BlockStart | null {
    this.newColumn = newColumn;
    return this;
  }

  public replaceActiveBlockParser(): BlockStart | null {
    this.replaceActiveBlockParser = true;
    return this;
  }
}

import { BlockParser, BlockStart } from "../parser";

class BlockStartImpl extends BlockStart {
  private readonly blockParsers: BlockParser[];
  private newIndex = -1;
  private newColumn = -1;
  private replaceActiveBlockParser = false;

  public constructor(...blockParsers: BlockParser[]) {
    super();
    this.blockParsers = blockParsers;
  }

  public getBlockParsers(): BlockParser[] {
    return this.blockParsers;
  }

  public getNewIndex(): number {
    return this.newIndex;
  }

  public getNewColumn(): number {
    return this.newColumn;
  }

  public isReplaceActiveBlockParser(): boolean {
    return this.replaceActiveBlockParser;
  }

  public atIndex(newIndex: number): BlockStart {
    this.newIndex = newIndex;

    return this;
  }

  public atColumn(newColumn: number): BlockStart {
    this.newColumn = newColumn;
    return this;
  }

  public setReplaceActiveBlockParser(): BlockStart {
    this.replaceActiveBlockParser = true;
    return this;
  }
}

export default BlockStartImpl;

import type { BlockParser } from '@/parser';

import { BlockStart } from '@/parser';

class BlockStartImpl extends BlockStart {
  private readonly blockParsers: BlockParser[];
  private newIndex = -1;
  private newColumn = -1;
  private replaceActiveBlockParser = false;

  constructor(...blockParsers: BlockParser[]) {
    super();

    this.blockParsers = blockParsers;
  }

  getBlockParsers(): BlockParser[] {
    return this.blockParsers;
  }

  getNewIndex(): number {
    return this.newIndex;
  }

  getNewColumn(): number {
    return this.newColumn;
  }

  isReplaceActiveBlockParser(): boolean {
    return this.replaceActiveBlockParser;
  }

  override atIndex(newIndex: number): BlockStart {
    this.newIndex = newIndex;

    return this;
  }

  override atColumn(newColumn: number): BlockStart {
    this.newColumn = newColumn;

    return this;
  }

  override setReplaceActiveBlockParser(): BlockStart {
    this.replaceActiveBlockParser = true;

    return this;
  }
}

export default BlockStartImpl;

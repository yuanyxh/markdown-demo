import { BlockContinue } from '@/parser';

class BlockContinueImpl extends BlockContinue {
  private readonly newIndex: number;
  private readonly newColumn: number;
  private readonly finalize: boolean;

  constructor(newIndex: number, newColumn: number, finalize: boolean) {
    super();

    this.newIndex = newIndex;
    this.newColumn = newColumn;
    this.finalize = finalize;
  }

  getNewIndex(): number {
    return this.newIndex;
  }

  getNewColumn(): number {
    return this.newColumn;
  }

  isFinalize(): boolean {
    return this.finalize;
  }
}

export default BlockContinueImpl;

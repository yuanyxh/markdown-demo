import { BlockContinue } from "@/parser";

class BlockContinueImpl extends BlockContinue {
  private readonly newIndex: number;
  private readonly newColumn: number;
  private readonly finalize: boolean;

  public constructor(newIndex: number, newColumn: number, finalize: boolean) {
    super();

    this.newIndex = newIndex;
    this.newColumn = newColumn;
    this.finalize = finalize;
  }

  public getNewIndex(): number {
    return this.newIndex;
  }

  public getNewColumn(): number {
    return this.newColumn;
  }

  public isFinalize(): boolean {
    return this.finalize;
  }
}

export default BlockContinueImpl;

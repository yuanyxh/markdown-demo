export class BlockContinueImpl extends BlockContinue {
  private readonly newIndex: int;
  private readonly newColumn: int;
  private readonly finalize: boolean;

  public constructor(newIndex: int, newColumn: int, finalize: boolean) {
    super();
    this.newIndex = newIndex;
    this.newColumn = newColumn;
    this.finalize = finalize;
  }

  public getNewIndex(): int {
    return this.newIndex;
  }

  public getNewColumn(): int {
    return this.newColumn;
  }

  public isFinalize(): boolean {
    return this.finalize;
  }
}

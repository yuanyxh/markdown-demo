/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
export class BlockContinue {
  public static none(): BlockContinue | null {
    return null;
  }

  public static atIndex(newIndex: number): BlockContinue {
    return new BlockContinueImpl(newIndex, -1, false);
  }

  public static atColumn(newColumn: number): BlockContinue {
    return new BlockContinueImpl(-1, newColumn, false);
  }

  public static finished(): BlockContinue {
    return new BlockContinueImpl(-1, -1, true);
  }
}

export class BlockContinueImpl extends BlockContinue {
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

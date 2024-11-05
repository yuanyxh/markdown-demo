class StrongEmphasis extends Node implements Delimited {
  private delimiter: string | null;

  public constructor();

  public constructor(delimiter: string | null);
  public constructor(...args: unknown[]) {
    switch (args.length) {
      case 0: {
        super();

        break;
      }

      case 1: {
        const [delimiter] = args as [string];

        super();
        this.delimiter = delimiter;

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public setDelimiter(delimiter: string | null): void {
    this.delimiter = delimiter;
  }

  public getOpeningDelimiter(): string | null {
    return this.delimiter;
  }

  public getClosingDelimiter(): string | null {
    return this.delimiter;
  }

  public accept(visitor: Visitor | null): void {
    visitor.visit(this);
  }
}

export default StrongEmphasis;

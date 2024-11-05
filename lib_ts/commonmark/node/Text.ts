class Text extends Node {
  private literal: string | null;

  public constructor();

  public constructor(literal: string | null);
  public constructor(...args: unknown[]) {
    switch (args.length) {
      case 0: {
        super();

        break;
      }

      case 1: {
        const [literal] = args as [string];

        super();
        this.literal = literal;

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public accept(visitor: Visitor | null): void {
    visitor.visit(this);
  }

  public getLiteral(): string | null {
    return this.literal;
  }

  public setLiteral(literal: string | null): void {
    this.literal = literal;
  }

  protected toStringAttributes(): string | null {
    return "literal=" + this.literal;
  }
}

export default Text;

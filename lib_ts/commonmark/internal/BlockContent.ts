class BlockContent {
  private readonly sb: stringBuilder | null;

  private lineCount: int = 0;

  public constructor();

  public constructor(content: string | null);
  public constructor(...args: unknown[]) {
    switch (args.length) {
      case 0: {
        super();
        this.sb = new stringBuilder();

        break;
      }

      case 1: {
        const [content] = args as [string];

        super();
        this.sb = new stringBuilder(content);

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public add(line: java.lang.CharSequence | null): void {
    if (this.lineCount !== 0) {
      this.sb.append("\n");
    }
    this.sb.append(line);
    this.lineCount++;
  }

  public getString(): string | null {
    return this.sb.toString();
  }
}

export default BlockContent;

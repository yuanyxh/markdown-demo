export abstract class ListHolder extends JavaObject {
  private static readonly INDENT_DEFAULT: string | null = "   ";
  private static readonly INDENT_EMPTY: string | null = "";

  private readonly parent: ListHolder | null;
  private readonly indent: string | null;

  protected constructor(parent: ListHolder | null) {
    super();
    this.parent = parent;

    if (parent !== null) {
      this.indent = parent.indent + ListHolder.INDENT_DEFAULT;
    } else {
      this.indent = ListHolder.INDENT_EMPTY;
    }
  }

  public getParent(): ListHolder | null {
    return this.parent;
  }

  public getIndent(): string | null {
    return this.indent;
  }
}

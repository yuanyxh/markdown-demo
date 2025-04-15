abstract class ListHolder {
  private static readonly INDENT_DEFAULT: string = '   ';
  private static readonly INDENT_EMPTY: string = '';

  private readonly parent: ListHolder | null = null;
  private readonly indent: string;

  protected constructor(parent: ListHolder | null) {
    this.parent = parent;

    if (parent !== null) {
      this.indent = parent.indent + ListHolder.INDENT_DEFAULT;
    } else {
      this.indent = ListHolder.INDENT_EMPTY;
    }
  }

  getParent(): ListHolder | null {
    return this.parent;
  }

  getIndent(): string {
    return this.indent;
  }
}

export default ListHolder;

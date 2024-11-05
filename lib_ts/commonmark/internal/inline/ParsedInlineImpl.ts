export class ParsedInlineImpl extends JavaObject implements ParsedInline {
  private readonly node: Node | null;
  private readonly position: Position | null;

  public constructor(node: Node | null, position: Position | null) {
    super();
    this.node = node;
    this.position = position;
  }

  public getNode(): Node | null {
    return this.node;
  }

  public getPosition(): Position | null {
    return this.position;
  }
}

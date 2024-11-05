export class LinkResultImpl extends JavaObject implements LinkResult {
  public includeMarker(): LinkResult | null {
    this.includeMarker = true;
    return this;
  }

  public static Type = class Type extends java.lang.Enum<Type> {
    public static readonly WRAP: Type = new (class extends Type {})(S`WRAP`, 0);
    public static readonly REPLACE: Type = new (class extends Type {})(
      S`REPLACE`,
      1
    );
  };

  private readonly type: LinkResultImpl.Type | null;
  private readonly node: Node | null;
  private readonly position: Position | null;

  private includeMarker: boolean = false;

  public constructor(
    type: LinkResultImpl.Type | null,
    node: Node | null,
    position: Position | null
  ) {
    super();
    this.type = type;
    this.node = node;
    this.position = position;
  }

  public getType(): LinkResultImpl.Type | null {
    return this.type;
  }

  public getNode(): Node | null {
    return this.node;
  }

  public getPosition(): Position | null {
    return this.position;
  }

  public isIncludeMarker(): boolean {
    return this.includeMarker;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace LinkResultImpl {
  export type Type = InstanceType<typeof LinkResultImpl.Type>;
}

import type { Node } from "../../node";
import type { LinkResult, Position } from "../../parser";

enum Type {
  WRAP = "WRAP",
  REPLACE = "REPLACE",
}

class LinkResultImpl implements LinkResult {
  public setIncludeMarker(): LinkResult {
    this.includeMarker = true;

    return this;
  }

  public static Type = Type;

  private readonly type: Type;
  private readonly node: Node;
  private readonly position: Position;

  private includeMarker: boolean = false;

  public constructor(type: Type, node: Node, position: Position) {
    this.type = type;
    this.node = node;
    this.position = position;
  }

  public getType(): Type {
    return this.type;
  }

  public getNode(): Node {
    return this.node;
  }

  public getPosition(): Position {
    return this.position;
  }

  public isIncludeMarker(): boolean {
    return this.includeMarker;
  }
}

export default LinkResultImpl;

import type { Node } from '@/node';
import type { LinkResult, Position } from '@/parser';

enum Type {
  WRAP = 'WRAP',
  REPLACE = 'REPLACE'
}

class LinkResultImpl implements LinkResult {
  setIncludeMarker(): LinkResult {
    this.includeMarker = true;

    return this;
  }

  static Type = Type;

  private readonly type: Type;
  private readonly node: Node;
  private readonly position: Position;

  private includeMarker: boolean = false;

  constructor(type: Type, node: Node, position: Position) {
    this.type = type;
    this.node = node;
    this.position = position;
  }

  getType(): Type {
    return this.type;
  }

  getNode(): Node {
    return this.node;
  }

  getPosition(): Position {
    return this.position;
  }

  isIncludeMarker(): boolean {
    return this.includeMarker;
  }
}

export default LinkResultImpl;

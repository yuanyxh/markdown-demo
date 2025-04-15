import type { Node } from '@/node';
import type { Position } from '@/parser';

import { ParsedInline } from '@/parser';

class ParsedInlineImpl implements ParsedInline {
  private readonly node: Node;
  private readonly position: Position;

  constructor(node: Node, position: Position) {
    this.node = node;
    this.position = position;
  }

  getNode(): Node {
    return this.node;
  }

  getPosition(): Position {
    return this.position;
  }
}

export default ParsedInlineImpl;

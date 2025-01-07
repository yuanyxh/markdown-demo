import type { MarkdownNode } from "@/node";
import type { Position } from "@/parser";

import { ParsedInline } from "@/parser";

class ParsedInlineImpl implements ParsedInline {
  private readonly node: MarkdownNode;
  private readonly position: Position;

  public constructor(node: MarkdownNode, position: Position) {
    this.node = node;
    this.position = position;
  }

  public getNode(): MarkdownNode {
    return this.node;
  }

  public getPosition(): Position {
    return this.position;
  }
}

export default ParsedInlineImpl;

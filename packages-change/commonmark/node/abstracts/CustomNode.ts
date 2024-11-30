import type { Visitor } from "../interfaces/Visitor";

import MarkdownNode from "./MarkdownNode";

abstract class CustomNode extends MarkdownNode {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default CustomNode;

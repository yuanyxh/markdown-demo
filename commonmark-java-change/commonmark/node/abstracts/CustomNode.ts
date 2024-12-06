import type { Visitor } from "../interfaces/Visitor";

import MarkdownNode from "./MarkdownNode";

/**
 * 自定义节点的共同抽象类
 */
abstract class CustomNode extends MarkdownNode {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default CustomNode;

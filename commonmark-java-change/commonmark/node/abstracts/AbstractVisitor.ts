import type MarkdownNode from "./MarkdownNode";
import type { Visitor } from "../interfaces/Visitor";

/**
 * Abstract visitor that visits all children by default.
 * <p>
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 *
 * 默认情况下访问所有子级的抽象访问者
 * <p>
 * 可用于仅处理某些节点；
 * 如果重写 visit 方法并希望访问子节点，调用 {@link #visitChildren}
 */
abstract class AbstractVisitor implements Visitor {
  /**
   * 访问节点
   *
   * @param node
   */
  public visit(node: MarkdownNode) {
    this.visitChildren(node);
  }

  /**
   * Visit the child nodes.
   *
   * 访问子节点
   *
   * @param parent the parent node whose children should be visited
   */
  protected visitChildren(parent: MarkdownNode): void {
    let node = parent.getFirstChild();

    while (node !== null) {
      // A subclass of this visitor might modify the node, resulting in getNext returning a different node or no
      // node after visiting it. So get the next node before visiting.
      const next = node.getNext();
      node.accept(this);
      node = next;
    }
  }
}

export default AbstractVisitor;

import type Node from './Node';
import type { Visitor } from '../interfaces/Visitor';

/**
 * Abstract visitor that visits all children by default.
 * <p>
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 */
abstract class AbstractVisitor implements Visitor {
  visit(node: Node) {
    this.visitChildren(node);
  }

  protected visitChildren(parent: Node): void {
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

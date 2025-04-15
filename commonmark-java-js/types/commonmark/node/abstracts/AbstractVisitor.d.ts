import type Node from './Node';
import type { Visitor } from '../interfaces/Visitor';
/**
 * Abstract visitor that visits all children by default.
 * <p>
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 */
declare abstract class AbstractVisitor implements Visitor {
    visit(node: Node): void;
    protected visitChildren(parent: Node): void;
}
export default AbstractVisitor;

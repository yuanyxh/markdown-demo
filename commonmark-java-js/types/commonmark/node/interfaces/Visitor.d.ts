import type Node from '../abstracts/Node';
/**
 * Node visitor.
 * <p>
 * Implementations should subclass {@link AbstractVisitor} instead of implementing this directly.
 */
export interface Visitor {
    visit(node: Node): void;
}

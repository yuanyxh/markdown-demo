import type MarkdownNode from "../abstracts/MarkdownNode";

/**
 * MarkdownNode visitor.
 * <p>
 * Implementations should subclass {@link AbstractVisitor} instead of implementing this directly.
 */
export interface Visitor {
  visit(node: MarkdownNode): void;
}

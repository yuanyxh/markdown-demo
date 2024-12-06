import type MarkdownNode from "../abstracts/MarkdownNode";

/**
 * MarkdownNode visitor.
 * <p>
 * Implementations should subclass {@link AbstractVisitor} instead of implementing this directly.
 *
 * MarkdownNode 访问器接口
 * <p>
 * 实现应该子类化 {@link AbstractVisitor} 而不是直接实现它
 */
export interface Visitor {
  visit(node: MarkdownNode): void;
}

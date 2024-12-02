import type { MarkdownNode } from "../../node";

/**
 * A renderer for a set of node types.
 *
 * 一组节点类型的渲染器
 */
export interface NodeRenderer {
  /**
   * @return the types of nodes that this renderer handles
   *
   * 返回该渲染器处理的节点类型
   */
  getNodeTypes(): Set<typeof MarkdownNode>;

  /**
   * Render the specified node.
   *
   * 渲染指定节点，要渲染的节点是 {@link #getNodeTypes()} 返回的节点类型
   *
   * @param node the node to render, will be an instance of one of {@link #getNodeTypes()}
   */
  render(node: MarkdownNode): void;

  /**
   * Called before the root node is rendered, to do any initial processing at the start.
   *
   * 在渲染根节点之前调用，以在开始时进行任何初始处理
   *
   * @param rootNode the root (top-level) node
   */
  beforeRoot(rootNode: MarkdownNode): void;

  /**
   * Called after the root node is rendered, to do any final processing at the end.
   *
   * 在渲染根节点后调用，以在最后进行任何最终处理
   *
   * @param rootNode the root (top-level) node
   */
  afterRoot(rootNode: MarkdownNode): void;
}

import type MarkdownWriter from "../MarkdownWriter";
import type { MarkdownNode } from "../../../node";

/**
 * Context that is passed to custom node renderers, see {@link MarkdownNodeRendererFactory#create}.
 *
 * 传递给自定义 NodeRenderer 的上下文，请参阅{@link MarkdownNodeRendererFactory#create}。
 */
export interface MarkdownNodeRendererContext {
  /**
   * @return the writer to use
   */
  getWriter(): MarkdownWriter;

  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * 使用配置的 Renderer 渲染指定的节点及其子节点
   * 应该用于渲染子项节点；注意不要传递正在渲染的节点，否则会导致无限循环
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;

  /**
   * 出现在普通文本中，需要转义的其他特殊字符；目前只有 ASCII 可以使用字符展示（不需要转义）
   *
   * @return additional special characters that need to be escaped if they occur in normal text; currently only ASCII
   * characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}

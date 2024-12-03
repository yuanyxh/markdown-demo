import type LineBreakRendering from "../enums/LineBreakRendering";
import type TextContentWriter from "../TextContentWriter";
import type { MarkdownNode } from "../../../node";

/**
 * 将节点渲染为文本的渲染上下文接口
 */
export interface TextContentNodeRendererContext {
  /**
   * Controls how line breaks should be rendered, see {@link LineBreakRendering}.
   *
   * 控制换行符的呈现方式
   */
  lineBreakRendering(): LineBreakRendering;

  /**
   * @return true for stripping new lines and render text as "single line",
   * false for keeping all line breaks.
   * @deprecated Use {@link #lineBreakRendering()} instead
   */
  stripNewlines(): boolean;

  /**
   * @return the writer to use
   */
  getWriter(): TextContentWriter;

  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * 使用配置的 Renderer 渲染指定的节点及其子节点；应该用于渲染子项节点；注意不要传递正在渲染的节点，否则会导致无限循环
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;
}

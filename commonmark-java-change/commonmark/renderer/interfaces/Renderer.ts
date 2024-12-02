import type { Appendable } from "../../../helpers";
import type { MarkdownNode } from "../../node";

/**
 * 渲染器接口
 */
export interface Renderer {
  /**
   * Render the tree of nodes to output.
   *
   * 渲染节点树以输出
   *
   * @param node the root node
   * @param output output for rendering
   */
  render(node: MarkdownNode, output: Appendable): void;
}

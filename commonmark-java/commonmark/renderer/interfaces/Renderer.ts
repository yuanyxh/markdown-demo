import type { Appendable } from "../../../helpers";
import type { MarkdownNode } from "../../node";

export interface Renderer {
  /**
   * Render the tree of nodes to output.
   *
   * @param node the root node
   * @param output output for rendering
   */
  render(node: MarkdownNode, output: Appendable): void;
}

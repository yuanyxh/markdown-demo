import { Appendable } from "../../common";
import { Node } from "../node";

export interface Renderer {
  /**
   * Render the tree of nodes to output.
   *
   * @param node the root node
   * @param output output for rendering
   */
  render(node: Node, output: Appendable): void;
}

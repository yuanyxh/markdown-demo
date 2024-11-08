import type MarkdownWriter from "../MarkdownWriter";
import type { Node } from "../../../node";

/**
 * Context that is passed to custom node renderers, see {@link MarkdownNodeRendererFactory#create}.
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
   * @param node the node to render
   */
  render(node: Node): void;

  /**
   * @return additional special characters that need to be escaped if they occur in normal text; currently only ASCII
   * characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}

import type { MarkdownNodeRendererContext } from "./MarkdownNodeRendererContext";
import type { NodeRenderer } from "../../interfaces/NodeRenderer";

/**
 * Factory for instantiating new node renderers for rendering custom nodes.
 */
export interface MarkdownNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: MarkdownNodeRendererContext): NodeRenderer;

  /**
   * @return the additional special characters that this factory would like to have escaped in normal text; currently
   * only ASCII characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}

import type { NodeRenderer } from "../../interfaces/NodeRenderer";
import type { HtmlNodeRendererContext } from "./HtmlNodeRendererContext";

/**
 * Factory for instantiating new node renderers when rendering is done.
 */
export interface HtmlNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: HtmlNodeRendererContext): NodeRenderer;
}

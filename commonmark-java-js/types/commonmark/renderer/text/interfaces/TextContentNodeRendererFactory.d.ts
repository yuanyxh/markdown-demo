import type { TextContentNodeRendererContext } from "./TextContentNodeRendererContext";
import type { NodeRenderer } from "../../interfaces/NodeRenderer";
/**
 * Factory for instantiating new node renderers when rendering is done.
 */
export interface TextContentNodeRendererFactory {
    /**
     * Create a new node renderer for the specified rendering context.
     *
     * @param context the context for rendering (normally passed on to the node renderer)
     * @return a node renderer
     */
    create(context: TextContentNodeRendererContext): NodeRenderer;
}

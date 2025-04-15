import type { Node } from '@/node';
/**
 * A renderer for a set of node types.
 */
export interface NodeRenderer {
    /**
     * @return the types of nodes that this renderer handles
     */
    getNodeTypes(): Set<typeof Node>;
    /**
     * Render the specified node.
     *
     * @param node the node to render, will be an instance of one of {@link #getNodeTypes()}
     */
    render(node: Node): void;
    /**
     * Called before the root node is rendered, to do any initial processing at the start.
     *
     * @param rootNode the root (top-level) node
     */
    beforeRoot(rootNode: Node): void;
    /**
     * Called after the root node is rendered, to do any final processing at the end.
     *
     * @param rootNode the root (top-level) node
     */
    afterRoot(rootNode: Node): void;
}

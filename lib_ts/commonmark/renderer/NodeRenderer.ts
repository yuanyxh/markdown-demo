


import { java } from "jree";



/**
 * A renderer for a set of node types.
 */
 abstract class NodeRenderer {

    /**
     * @return the types of nodes that this renderer handles
     */
    protected abstract  getNodeTypes(): java.util.Set<java.lang.Class< Node>>;

    /**
     * Render the specified node.
     *
     * @param node the node to render, will be an instance of one of {@link #getNodeTypes()}
     */
    protected abstract  render(node: Node| null): void;

    /**
     * Called before the root node is rendered, to do any initial processing at the start.
     *
     * @param rootNode the root (top-level) node
     */
    protected abstract  beforeRoot(rootNode: Node| null):  void {
    }

    /**
     * Called after the root node is rendered, to do any final processing at the end.
     *
     * @param rootNode the root (top-level) node
     */
    protected abstract  afterRoot(rootNode: Node| null):  void {
    }
}

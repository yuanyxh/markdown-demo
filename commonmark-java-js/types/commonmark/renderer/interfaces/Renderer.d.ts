import type { Appendable } from '@helpers/index';
import type { Node } from '@/node';
export interface Renderer {
    /**
     * Render the tree of nodes to output.
     *
     * @param node the root node
     * @param output output for rendering
     */
    render(node: Node, output: Appendable): void;
}

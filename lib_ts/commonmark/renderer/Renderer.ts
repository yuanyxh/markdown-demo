


import { java } from "jree";



 interface Renderer {

    /**
     * Render the tree of nodes to output.
     *
     * @param node the root node
     * @param output output for rendering
     */
      render(node: Node| null, output: java.lang.Appendable| null): void;

    /**
     * Render the tree of nodes to string.
     *
     * @param node the root node
     * @return the rendered string
     */
      render(node: Node| null): java.lang.String;
}

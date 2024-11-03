


import { java } from "jree";



 interface PostProcessor {

    /**
     * @param node the node to post-process
     * @return the result of post-processing, may be a modified {@code node} argument
     */
      process(node: Node| null): Node;

}

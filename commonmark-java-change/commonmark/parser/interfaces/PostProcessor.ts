import type { MarkdownNode } from "../../node";

/**
 * 后置处理的处理器接口
 */
export interface PostProcessor {
  /**
   * @param node the node to post-process
   * @return the result of post-processing, may be a modified {@code node} argument
   */
  process(node: MarkdownNode): MarkdownNode;
}

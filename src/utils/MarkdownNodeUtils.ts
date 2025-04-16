import type { Block, Node as MarkdownNode } from 'commonmark-java-js';
import type ContentView from '../views/abstracts/contentview';

/** Auxiliary tool class for Markdown node. */
class MarkdownNodeUtils {
  /**
   * Obtain the correct source code position of the Markdown block node.
   *
   * @param block Markdown block nodes
   * @returns {number} Position at the source code
   */
  static getContentIndex(block: Block): number {
    const child = block.getFirstChild();

    if (child === null) {
      const sources = block.getSourceSpans();
      const source = sources[0];

      if (source) {
        return source.getInputIndex() + source.getLength();
      }

      return -1;
    }

    const childSources = child.getSourceSpans();
    const source = childSources[0];

    if (source) {
      return source.getInputIndex();
    }

    return -1;
  }

  static getView(node: Node): ContentView | null {
    let curr: Node | null | undefined = node;

    while (!curr?.$view) {
      curr = curr?.parentNode;
    }

    return curr?.$view ?? null;
  }

  static getNode(node: Node): MarkdownNode | null {
    return this.getView(node)?.node ?? null;
  }

  /**
   * Obtain the constructor class of a node instance.
   *
   * @param node Markdown node
   * @returns {typeof MarkdownNode} constructor class of a node instance
   */
  static getConstructor(node: MarkdownNode): typeof MarkdownNode {
    return Object.getPrototypeOf(node).constructor;
  }

  /**
   * Check whether the position is inside the node.
   *
   * @param node
   * @param pos
   * @returns {boolean} When the pos is inside the node, return true.
   */
  static isInsideNode(node: MarkdownNode, pos: number): boolean {
    return pos >= node.inputIndex && pos <= node.inputEndIndex;
  }
}

export default MarkdownNodeUtils;

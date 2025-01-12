import type { MarkdownNode } from 'commonmark-java-js';

import EnhanceExtension from '@/abstracts/enhanceextension';
import { NodeTools, TypeTools } from '@/utils';

class FallbackPlugin extends EnhanceExtension {
  public override locateSrcPos(node: Node, offset: number): number {
    if (TypeTools.isText(node) && node.parentElement) {
      const el = node.parentElement;

      const textNode = el.$virtNode;

      if (!textNode) {
        return -1;
      }

      return textNode.inputIndex + offset;
    }

    const element = node as HTMLElement;

    const block = element.$virtNode;

    if (offset === 0) {
      return NodeTools.getContentIndex(block);
    }

    let isSoftLineBreak = false;
    let childMarkdownNode: MarkdownNode | null = block.children[offset - 1];

    if (childMarkdownNode.isBlock() && childMarkdownNode.getNext()) {
      childMarkdownNode = childMarkdownNode.getNext();
    }

    if (childMarkdownNode && TypeTools.isSoftLineBreak(childMarkdownNode)) {
      childMarkdownNode = childMarkdownNode.getPrevious();

      isSoftLineBreak = true;
    }

    if (!childMarkdownNode) {
      return -1;
    }

    if (isSoftLineBreak) {
      const continuousLine = childMarkdownNode.getNext()!.getNext();

      if (!continuousLine) {
        return childMarkdownNode.inputEndIndex + 1;
      }

      return continuousLine.inputIndex;
    }

    return childMarkdownNode.inputEndIndex;
  }
}

export default FallbackPlugin;

import type { MarkdownNode } from 'commonmark-java-js';

import type { ExtendsMarkdownNode, NodePoint } from '@/types';

import { Code, FencedCodeBlock, IndentedCodeBlock } from 'commonmark-java-js';

import EnhanceExtension from '@/abstracts/enhanceextension';
import { ElementTools, NodeTools, TypeTools } from '@/utils';

class CodePlugin extends EnhanceExtension {
  public override getTypes(): (typeof MarkdownNode)[] {
    return [Code, FencedCodeBlock, IndentedCodeBlock];
  }

  public override locateSrcPos(node: Node, offset: number): number {
    if (!(TypeTools.isText(node) && node.parentElement)) {
      return -1;
    }

    const mNode = node.parentElement.$virtNode;

    if (!(mNode && TypeTools.isCode(mNode))) {
      return -1;
    }

    return NodeTools.codeIndexOf(this.context.source, mNode, offset);
  }

  public override locatePointFromSrcPos(node: ExtendsMarkdownNode, pos: number): NodePoint | null {
    if (TypeTools.isCode(node)) {
      const textRange = NodeTools.codePoint(this.context.source, node);

      if (textRange !== false) {
        let inputIndex = node.inputIndex;

        if (TypeTools.isFencedCodeBlock(node)) {
          inputIndex += (node.getOpeningFenceLength() || 0) + (node.getFenceIndent() || 0);
        }

        if (
          pos >= inputIndex + textRange.textStart &&
          pos <= inputIndex + textRange.textStart + textRange.textEnd
        ) {
          return {
            node: ElementTools.getDomByNodeType(node),
            offset: pos - inputIndex - textRange.textStart
          };
        }
      }
    }

    return null;
  }
}

export default CodePlugin;

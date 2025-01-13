import EnhanceExtension from '@/abstracts/enhanceextension';
import { NodeTools, TypeTools } from '@/utils';

class HtmlBlockPlugin extends EnhanceExtension {
  public override locateSrcPos(node: Node, offset: number): number {
    let curr: Node | null = node;

    while (curr && curr !== this.context.dom) {
      if (!curr.$virtNode) {
        curr = curr.parentNode;

        continue;
      }

      if (!(TypeTools.isElement(curr) && TypeTools.isHtmlBlock(curr.$virtNode))) {
        return -1;
      }

      if (curr === node) {
        return offset === 0 ? curr.$virtNode.inputIndex : curr.$virtNode.inputEndIndex;
      }

      return NodeTools.findHtmlBlockSrcPos(node, curr, offset);
    }

    return -1;
  }
}

export default HtmlBlockPlugin;

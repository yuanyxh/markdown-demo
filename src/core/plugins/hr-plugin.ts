import EnhanceExtension from '@/abstracts/enhanceextension';
import { TypeTools } from '@/utils';

class HrPlugin extends EnhanceExtension {
  public override locateSrcPos(node: Node, offset: number): number {
    if (!TypeTools.isElement(node)) {
      return -1;
    }

    let el: Node | null = node.childNodes[offset - 1];

    if (!el) {
      return -1;
    }

    if (!TypeTools.isThematicBreak(el.$virtNode)) {
      if (
        TypeTools.isBlockNode(el.$virtNode) &&
        el.nextSibling &&
        TypeTools.isThematicBreak(el.nextSibling.$virtNode)
      ) {
        return el.nextSibling.$virtNode.inputIndex;
      }

      return -1;
    }

    return el.$virtNode.inputEndIndex;
  }
}

export default HrPlugin;

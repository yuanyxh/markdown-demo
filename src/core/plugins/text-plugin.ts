import type { MarkdownNode } from 'commonmark-java-js';

import type { ExtendsMarkdownNode, NodePoint } from '@/types';

import { Text as MarkdownText } from 'commonmark-java-js';

import EnhanceExtension from '@/abstracts/enhanceextension';
import { ElementTools } from '@/utils';

class TextPlugin extends EnhanceExtension {
  public override getTypes(): (typeof MarkdownNode)[] {
    return [MarkdownText];
  }

  public override locatePointFromSrcPos(node: ExtendsMarkdownNode, pos: number): NodePoint | null {
    return { node: ElementTools.getDomByNodeType(node), offset: pos - node.inputIndex };
  }
}

export default TextPlugin;

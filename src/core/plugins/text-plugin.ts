import type { MarkdownNode } from 'commonmark-java-js';

import type { NodePoint } from '@/interfaces';

import { Text as MarkdownText } from 'commonmark-java-js';

import EnhanceExtension from '@/abstracts/enhanceextension';
import { getDomOfType } from '@/utils';

class TextPlugin extends EnhanceExtension {
  public getTypes(): (typeof MarkdownNode)[] {
    return [MarkdownText];
  }

  public override locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null {
    return { node: getDomOfType(node), offset: pos - node.inputIndex };
  }
}

export default TextPlugin;

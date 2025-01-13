import type { MarkdownNode } from 'commonmark-java-js';

import { Emphasis, SourceSpan, StrongEmphasis } from 'commonmark-java-js';

import EnhanceExtension from '@/abstracts/enhanceextension';
import { SourceText } from '@/node';

class EmphasisPlugin extends EnhanceExtension {
  public override getTypes(): (typeof MarkdownNode)[] {
    return [Emphasis, StrongEmphasis];
  }

  public override adjustNode(node: MarkdownNode): MarkdownNode {
    if (node instanceof Emphasis || node instanceof StrongEmphasis) {
      const spans = node.getSourceSpans();

      if (spans.length) {
        const openingDelimiter = node.getOpeningDelimiter() || '';
        const closingDelimiter = node.getClosingDelimiter() || '';

        const before = new SourceText(openingDelimiter, node);
        const after = new SourceText(closingDelimiter, node);

        before.addSourceSpan(
          SourceSpan.of(
            spans[0].getLineIndex(),
            spans[0].getColumnIndex(),
            node.inputIndex,
            openingDelimiter.length
          )
        );

        after.addSourceSpan(
          SourceSpan.of(
            spans[spans.length - 1].getLineIndex(),
            spans[spans.length - 1].getColumnIndex(),
            node.inputEndIndex - closingDelimiter.length,
            closingDelimiter.length
          )
        );

        node.prependChild(before);
        node.appendChild(after);
      }
    }

    return node;
  }
}

export default EmphasisPlugin;

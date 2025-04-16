import type { BlockQuote } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';

import BlockView from './abstracts/blockview';

class BlockQuoteView extends BlockView {
  children: BlockView[] = [];
  node: BlockQuote;

  constructor(node: BlockQuote, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  protected override createElement(): HTMLQuoteElement {
    const blockquote = window.document.createElement('blockquote');

    return blockquote;
  }
}

export default BlockQuoteView;

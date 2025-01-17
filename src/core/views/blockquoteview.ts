import type { BlockQuote } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';

class BlockQuoteView extends BlockView {
  public children: BlockView[] = [];
  public node: BlockQuote;

  public constructor(node: BlockQuote) {
    super(node);

    this.node = node;
  }

  protected override createElement(): HTMLQuoteElement {
    const blockquote = window.document.createElement('blockquote');

    return blockquote;
  }

  public static override craete(node: BlockQuote): BlockQuoteView {
    return new this(node);
  }
}

export default BlockQuoteView;

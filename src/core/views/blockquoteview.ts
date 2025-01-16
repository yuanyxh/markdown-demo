import type { BlockQuote } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';

class BlockQuoteView extends BlockView {
  public length: number = 0;
  public children: BlockView[] = [];
  public node: BlockQuote;

  public constructor(node: BlockQuote) {
    super(node);

    this.node = node;
  }

  protected override createElement(): HTMLElement {
    const blockquote = window.document.createElement('blockquote');

    return blockquote;
  }

  public static override craete(node: BlockQuote): BlockQuoteView {
    return new this(node);
  }
}

export default BlockQuoteView;

import type { Paragraph } from 'commonmark-java-js';

import type InlineView from './abstracts/inlineview';

import BlockView from './abstracts/blockview';

class ParagraphView extends BlockView {
  public children: InlineView[] = [];

  protected override createElement(): HTMLParagraphElement {
    return window.document.createElement('p');
  }

  public static override craete(node: Paragraph): ParagraphView {
    return new this(node);
  }
}

export default ParagraphView;

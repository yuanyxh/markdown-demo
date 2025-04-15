import type { Paragraph } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type InlineView from './abstracts/inlineview';

import BlockView from './abstracts/blockview';

class ParagraphView extends BlockView {
  children: InlineView[] = [];

  protected override createElement(): HTMLParagraphElement {
    return window.document.createElement('p');
  }

  static override craete(node: Paragraph, context: EditorContext): ParagraphView {
    return new this(node, context);
  }
}

export default ParagraphView;

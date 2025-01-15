import type { MarkdownNode } from 'commonmark-java-js';

import EventHandler from '@/views/event/eventhandler';
import BlockView from './abstracts/blockview';
import InlineView from './abstracts/inlineview';

class ParagraphView extends BlockView {
  public length: number = 0;
  public children: InlineView[] = [];
  protected handler: EventHandler;

  public constructor() {
    super();

    this.handler = EventHandler.create(this);
  }

  public override toDOMRepr(): HTMLElement {
    return window.document.createElement('p');
  }
}

export default ParagraphView;

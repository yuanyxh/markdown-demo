import type { MarkdownNode } from 'commonmark-java-js';

import ContentView from './abstracts/contentview';
import InlineView from './abstracts/inlineview';
import EventHandler from './event/eventhandler';

class TextView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];
  protected handler: EventHandler;

  public constructor() {
    super();

    this.handler = EventHandler.create(this);
  }

  public override toDOMRepr(): HTMLElement {
    return window.document.createElement('span');
  }
}

export default TextView;

import type { Link } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class LinkView extends InlineView {
  children: ContentView[] = [];
  node: Link;

  constructor(node: Link) {
    super(node);

    this.node = node;
  }

  override eq(node: Link): boolean {
    return node.type === this.node.type && node.getDestination() === this.node.getDestination();
  }

  protected override createElement(node: Link): HTMLAnchorElement {
    const a = window.document.createElement('a');
    a.href = node.getDestination();

    if (node.getTitle()) {
      a.title = node.getTitle() || '';
    }

    return a;
  }

  static override craete(node: Link): LinkView {
    return new this(node);
  }
}

export default LinkView;

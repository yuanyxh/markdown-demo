import type { Link } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class LinkView extends InlineView {
  children: ContentView[] = [];
  node: Link;

  constructor(node: Link, context: EditorContext) {
    super(node, context);

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

  static override craete(node: Link, context: EditorContext): LinkView {
    return new this(node, context);
  }
}

export default LinkView;

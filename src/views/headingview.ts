import type { Heading } from 'commonmark-java-js';

import type InlineView from './abstracts/inlineview';

import BlockView from './abstracts/blockview';

class HeadingView extends BlockView {
  children: InlineView[] = [];
  node: Heading;

  constructor(node: Heading) {
    super(node);

    this.node = node;
  }

  override eq(node: Heading): boolean {
    return node.type === this.node.type && node.getLevel() === this.node.getLevel();
  }

  protected createElement(node: Heading): HTMLElement {
    return window.document.createElement('h' + node.getLevel());
  }

  static craete(node: Heading): HeadingView {
    return new this(node);
  }
}

export default HeadingView;

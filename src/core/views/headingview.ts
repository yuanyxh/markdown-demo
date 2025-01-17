import type { Heading } from 'commonmark-java-js';

import type InlineView from './abstracts/inlineview';

import BlockView from './abstracts/blockview';

class HeadingView extends BlockView {
  public length: number = 0;
  public children: InlineView[] = [];
  public node: Heading;

  public constructor(node: Heading) {
    super(node);

    this.node = node;
  }

  public override eq(node: Heading): boolean {
    return node.type === this.node.type && node.getLevel() === this.node.getLevel();
  }

  protected createElement(node: Heading): HTMLElement {
    return window.document.createElement('h' + node.getLevel());
  }

  public static craete(node: Heading): HeadingView {
    return new this(node);
  }
}

export default HeadingView;

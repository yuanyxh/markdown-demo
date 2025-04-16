import type { Heading } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type InlineView from './abstracts/inlineview';

import BlockView from './abstracts/blockview';

class HeadingView extends BlockView {
  children: InlineView[] = [];
  node: Heading;

  constructor(node: Heading, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: Heading): boolean {
    return node.type === this.node.type && node.getLevel() === this.node.getLevel();
  }

  protected createElement(node: Heading): HTMLElement {
    return window.document.createElement('h' + node.getLevel());
  }
}

export default HeadingView;

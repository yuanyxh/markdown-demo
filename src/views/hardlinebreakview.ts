import type { HardLineBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class HardLineBreakView extends InlineView {
  children: ContentView[] = [];
  node: HardLineBreak;

  constructor(node: HardLineBreak) {
    super(node);

    this.node = node;
  }

  override eq(node: HardLineBreak): boolean {
    return node.type === this.node.type;
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(): HTMLBRElement {
    return window.document.createElement('br');
  }

  static override craete(node: HardLineBreak): HardLineBreakView {
    return new this(node);
  }
}

export default HardLineBreakView;

import type { HardLineBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class HardLineBreakView extends InlineView {
  public children: ContentView[] = [];
  public node: HardLineBreak;

  public constructor(node: HardLineBreak) {
    super(node);

    this.node = node;
  }

  public override eq(node: HardLineBreak): boolean {
    return node.type === this.node.type;
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(): HTMLBRElement {
    return window.document.createElement('br');
  }

  public static override craete(node: HardLineBreak): HardLineBreakView {
    return new this(node);
  }
}

export default HardLineBreakView;

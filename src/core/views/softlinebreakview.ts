import type { SoftLineBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class SoftLineBreakView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: SoftLineBreak;

  public constructor(node: SoftLineBreak) {
    super(node);

    this.node = node;
  }

  public override eq(node: SoftLineBreak): boolean {
    return node.type === this.node.type;
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('br');
  }

  public static override craete(node: SoftLineBreak): SoftLineBreakView {
    return new this(node);
  }
}

export default SoftLineBreakView;

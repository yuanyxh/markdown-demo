import type { SoftLineBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class SoftLineBreakView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];

  protected override createElement(): HTMLBRElement {
    return window.document.createElement('br');
  }

  public static override craete(node: SoftLineBreak): SoftLineBreakView {
    return new this(node);
  }
}

export default SoftLineBreakView;

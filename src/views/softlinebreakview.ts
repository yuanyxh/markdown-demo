import type { SoftLineBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class SoftLineBreakView extends InlineView {
  children: ContentView[] = [];

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(): HTMLBRElement {
    return window.document.createElement('br');
  }

  static override craete(node: SoftLineBreak): SoftLineBreakView {
    return new this(node);
  }
}

export default SoftLineBreakView;

import type { SoftLineBreak } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
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
}

export default SoftLineBreakView;

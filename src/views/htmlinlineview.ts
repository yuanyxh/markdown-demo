import type { HtmlInline } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class HtmlInlineView extends InlineView {
  children: ContentView[] = [];
  node: HtmlInline;

  constructor(node: HtmlInline, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: HtmlInline): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.innerHTML;
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: HtmlInline): HTMLElement {
    const wrapper = window.document.createElement('span');

    wrapper.textContent = node.getLiteral();

    return wrapper;
  }
}

export default HtmlInlineView;

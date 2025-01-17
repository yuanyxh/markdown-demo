import type { HtmlInline } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class HtmlInlineView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: HtmlInline;

  public constructor(node: HtmlInline) {
    super(node);

    this.node = node;
  }

  public override eq(node: HtmlInline): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.innerHTML;
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: HtmlInline): HTMLElement {
    const wrapper = window.document.createElement('span');

    wrapper.textContent = node.getLiteral();

    return wrapper;
  }

  public static override craete(node: HtmlInline): HtmlInlineView {
    return new this(node);
  }
}

export default HtmlInlineView;

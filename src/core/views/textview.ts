import type { Text } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class TextView extends InlineView {
  public children: ContentView[] = [];
  public node: Text;

  public constructor(node: Text) {
    super(node);

    this.node = node;
  }

  public override eq(node: Text): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.textContent;
  }

  public override setNode(node: Text): void {
    this.node = node;

    if (node.getLiteral() !== this.dom.textContent) {
      this.dom.textContent = node.getLiteral();
    }
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: Text): HTMLSpanElement {
    const span = window.document.createElement('span');
    span.textContent = node.getLiteral();

    return span;
  }

  public static override craete(node: Text): TextView {
    return new this(node);
  }
}

export default TextView;

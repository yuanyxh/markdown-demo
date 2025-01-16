import type { Text } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class TextView extends InlineView {
  public length: number = 0;
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

  protected override createElement(): HTMLElement {
    return window.document.createElement('span');
  }

  public static override craete(node: Text): TextView {
    return new this(node);
  }
}

export default TextView;

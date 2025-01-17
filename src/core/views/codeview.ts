import type { Code } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class CodeView extends InlineView {
  public children: ContentView[] = [];

  public override eq(node: Code): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.textContent;
  }

  public override setNode(node: Code): void {
    this.node = node;

    if (node.getLiteral() !== this.dom.textContent) {
      this.dom.textContent = node.getLiteral();
    }
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: Code): HTMLElement {
    const code = window.document.createElement('code');
    code.textContent = node.getLiteral();

    code.setAttribute('data-inline', 'true');

    return code;
  }

  public static override craete(node: Code): CodeView {
    return new this(node);
  }
}

export default CodeView;

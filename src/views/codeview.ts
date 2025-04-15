import type { Code } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class CodeView extends InlineView {
  children: ContentView[] = [];

  override eq(node: Code): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.textContent;
  }

  override setNode(node: Code): void {
    this.node = node;

    if (node.getLiteral() !== this.dom.textContent) {
      this.dom.textContent = node.getLiteral();
    }
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: Code): HTMLElement {
    const code = window.document.createElement('code');
    code.textContent = node.getLiteral();

    code.setAttribute('data-inline', 'true');

    return code;
  }

  static override craete(node: Code, context: EditorContext): CodeView {
    return new this(node, context);
  }
}

export default CodeView;

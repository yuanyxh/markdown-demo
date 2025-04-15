import type { IndentedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class IndentedCodeBlockView extends BlockView {
  children: ContentView[] = [];
  node: IndentedCodeBlock;

  constructor(node: IndentedCodeBlock) {
    super(node);

    this.node = node;
  }

  override eq(node: IndentedCodeBlock): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.firstChild?.textContent;
  }

  override setNode(node: IndentedCodeBlock): void {
    if (node.getLiteral() !== this.dom.firstChild?.textContent) {
      if (this.dom.firstChild) {
        this.dom.firstChild.textContent = node.getLiteral();
      }
    }
  }

  override isOpend(): boolean {
    return false;
  }

  override destroy(): void {
    super.destroy();
  }

  protected override createElement(node: IndentedCodeBlock): HTMLPreElement {
    const block = window.document.createElement('pre');
    block.contentEditable = 'false';

    const code = window.document.createElement('code');
    code.contentEditable = 'true';

    code.textContent = node.getLiteral();
    block.appendChild(code);

    return block;
  }

  static override craete(node: IndentedCodeBlock): IndentedCodeBlockView {
    return new this(node);
  }
}

export default IndentedCodeBlockView;

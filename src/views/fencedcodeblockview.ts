import type { FencedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class FencedCodeBlockView extends BlockView {
  children: ContentView[] = [];
  node: FencedCodeBlock;

  constructor(node: FencedCodeBlock) {
    super(node);

    this.node = node;
  }

  override eq(node: FencedCodeBlock): boolean {
    return (
      node.type === this.node.type &&
      node.getFenceCharacter() === this.node.getFenceCharacter() &&
      node.getInfo() === this.node.getInfo() &&
      node.getLiteral() === this.dom.firstChild?.textContent
    );
  }

  override setNode(node: FencedCodeBlock): void {
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

  protected override createElement(node: FencedCodeBlock): HTMLPreElement {
    const block = window.document.createElement('pre');
    block.contentEditable = 'false';

    const code = window.document.createElement('code');
    code.contentEditable = 'true';

    code.textContent = node.getLiteral();
    block.appendChild(code);

    return block;
  }

  static override craete(node: FencedCodeBlock): FencedCodeBlockView {
    return new this(node);
  }
}

export default FencedCodeBlockView;

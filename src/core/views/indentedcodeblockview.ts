import type { IndentedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class IndentedCodeBlockView extends BlockView {
  public children: ContentView[] = [];
  public node: IndentedCodeBlock;

  public constructor(node: IndentedCodeBlock) {
    super(node);

    this.node = node;
  }

  public override eq(node: IndentedCodeBlock): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.firstChild?.textContent;
  }

  public override setNode(node: IndentedCodeBlock): void {
    if (node.getLiteral() !== this.dom.firstChild?.textContent) {
      if (this.dom.firstChild) {
        this.dom.firstChild.textContent = node.getLiteral();
      }
    }
  }

  public override isOpend(): boolean {
    return false;
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

  public static override craete(node: IndentedCodeBlock): IndentedCodeBlockView {
    return new this(node);
  }
}

export default IndentedCodeBlockView;

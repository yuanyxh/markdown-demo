import type { IndentedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class IndentedCodeBlockView extends BlockView {
  public length: number = 0;
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

  protected override createElement(): HTMLPreElement {
    const block = window.document.createElement('pre');
    const code = window.document.createElement('code');

    block.appendChild(code);

    return block;
  }

  public static override craete(node: IndentedCodeBlock): IndentedCodeBlockView {
    return new this(node);
  }
}

export default IndentedCodeBlockView;

import type { FencedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class FencedCodeBlockView extends BlockView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: FencedCodeBlock;

  public constructor(node: FencedCodeBlock) {
    super(node);

    this.node = node;
  }

  public override eq(node: FencedCodeBlock): boolean {
    return (
      node.type === this.node.type &&
      node.getFenceCharacter() === this.node.getFenceCharacter() &&
      node.getInfo() === this.node.getInfo() &&
      node.getLiteral() === this.dom.firstChild?.textContent
    );
  }

  public override setNode(node: FencedCodeBlock): void {
    if (node.getLiteral() !== this.dom.firstChild?.textContent) {
      if (this.dom.firstChild) {
        this.dom.firstChild.textContent = node.getLiteral();
      }
    }
  }

  protected override createElement(): HTMLElement {
    const block = window.document.createElement('pre');
    const code = window.document.createElement('code');

    block.appendChild(code);

    return block;
  }

  public static override craete(node: FencedCodeBlock): FencedCodeBlockView {
    return new this(node);
  }
}

export default FencedCodeBlockView;

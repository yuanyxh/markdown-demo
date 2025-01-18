import type { FencedCodeBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';
import CodeBlockHandler from '@/events/codeblockeventhandler';

class FencedCodeBlockView extends BlockView {
  public children: ContentView[] = [];
  public node: FencedCodeBlock;

  private handler: CodeBlockHandler = CodeBlockHandler.create(this);

  public constructor(node: FencedCodeBlock) {
    super(node);

    this.node = node;

    this.handler.listenForCodeBlockViewDOM(this.dom);
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

  public override isOpend(): boolean {
    return false;
  }

  public override destroy(): void {
    super.destroy();

    this.handler.listenForCodeBlockViewDOM(this.dom);
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

  public static override craete(node: FencedCodeBlock): FencedCodeBlockView {
    return new this(node);
  }
}

export default FencedCodeBlockView;

import type { HtmlBlock } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class HtmlBlockView extends BlockView {
  public children: ContentView[] = [];
  public node: HtmlBlock;

  public constructor(node: HtmlBlock) {
    super(node);

    this.node = node;
  }

  public override eq(node: HtmlBlock): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.innerHTML;
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: HtmlBlock): HTMLDivElement {
    const wrapper = window.document.createElement('div');

    wrapper.innerHTML = node.getLiteral();

    return wrapper;
  }

  public static override craete(node: HtmlBlock): HtmlBlockView {
    return new this(node);
  }
}

export default HtmlBlockView;

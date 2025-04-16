import type { HtmlBlock } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class HtmlBlockView extends BlockView {
  children: ContentView[] = [];
  node: HtmlBlock;

  constructor(node: HtmlBlock, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: HtmlBlock): boolean {
    return node.type === this.node.type && node.getLiteral() === this.dom.innerHTML;
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: HtmlBlock): HTMLDivElement {
    const wrapper = window.document.createElement('div');

    wrapper.innerHTML = node.getLiteral();

    return wrapper;
  }
}

export default HtmlBlockView;

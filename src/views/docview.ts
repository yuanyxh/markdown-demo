import type { Document } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';

class DocView extends BlockView {
  children: BlockView[] = [];

  constructor(node: Document) {
    super(node);

    this.applyNode(node);
  }

  override destroy(): void {
    super.destroy();
  }

  protected override createElement(): HTMLDivElement {
    const dom = window.document.createElement('div');

    dom.classList.add('editor');
    dom.spellcheck = false;
    dom.contentEditable = 'true';
    dom.ariaAutoComplete = 'off';
    dom.autocapitalize = 'off';
    dom.translate = false;
    dom.role = 'textbox';
    dom.ariaMultiLine = 'true';

    return dom;
  }

  static override craete(node: Document): DocView {
    return new this(node);
  }
}

export default DocView;

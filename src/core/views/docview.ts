import type { Document } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';
import DocEventHandler from './event/doceventhandler';

class DocView extends BlockView {
  public length: number = 0;
  public children: BlockView[] = [];

  protected handler: DocEventHandler = DocEventHandler.create(this);

  public constructor(node: Document) {
    super(node);

    this.handler.listenForViewDOM(this.dom);

    this.sync(node);
  }

  protected override createElement(node: Document): HTMLElement {
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

  public static override craete(node: Document): DocView {
    return new this(node);
  }
}

export default DocView;

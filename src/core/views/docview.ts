import type { Document } from 'commonmark-java-js';

import DocEventHandler from '@/events/doceventhandler';
import BlockView from './abstracts/blockview';

class DocView extends BlockView {
  public children: BlockView[] = [];

  private handler: DocEventHandler = DocEventHandler.create(this);

  public constructor(node: Document) {
    super(node);

    this.handler.listenForViewDOM(this.dom);

    this.applyNode(node);
  }

  public override destroy(): void {
    this.handler.unlistenForViewDOM(this.dom);

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

  public static override craete(node: Document): DocView {
    return new this(node);
  }
}

export default DocView;

import type { MarkdownNode } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';
import DocEventHandler from './event/doceventhandler';

class DocView extends BlockView {
  public length: number = 0;
  public children: BlockView[] = [];
  protected handler: DocEventHandler;

  public constructor() {
    super();

    this.handler = DocEventHandler.create(this);
  }

  public override toDOMRepr(): HTMLElement {
    const docDOM = window.document.createElement('div');

    docDOM.classList.add('editor');
    docDOM.spellcheck = false;
    docDOM.contentEditable = 'true';
    docDOM.ariaAutoComplete = 'off';
    docDOM.autocapitalize = 'off';
    docDOM.translate = false;
    docDOM.role = 'textbox';
    docDOM.ariaMultiLine = 'true';

    return docDOM;
  }
}

export default DocView;

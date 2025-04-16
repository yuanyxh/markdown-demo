import type { Document, Node } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import BlockView from './abstracts/blockview';

class DocView extends BlockView {
  children: BlockView[] = [];

  constructor(node: Document, context: EditorContext) {
    super(node, context);

    this.applyNode(node);
  }

  attachTo(element: HTMLElement): void {
    element.appendChild(this.dom);
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
}

export default DocView;

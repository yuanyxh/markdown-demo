import type ContentView from '../abstracts/contentview';

import EventHandler from './eventhandler';

class DocEventHandler extends EventHandler {
  public override listenForViewDOM(dom: HTMLElement): void {
    window.document.addEventListener('selectionchange', this.onDocumentSelectionChange);
    dom.addEventListener('beforeinput', this.onBeforeInput);
  }

  public override unlistenForViewDOM(dom: HTMLElement): void {
    window.document.removeEventListener('selectionchange', this.onDocumentSelectionChange);
    dom.removeEventListener('beforeinput', this.onBeforeInput);
  }

  private onBeforeInput = (e: InputEvent): void => {
    const range = e.getTargetRanges()[0];

    // TODO: element
    range.startContainer.dispatchEvent(
      new CustomEvent<ViewEventDetails>('modify', {
        detail: { type: e.inputType as InputType, range: range },
        bubbles: true,
        cancelable: false,
        composed: true
      })
    );
  };

  private onDocumentSelectionChange = (): void => {
    const selection = window.document.getSelection();

    if (
      window.document.activeElement !== this.view.dom ||
      selection === null ||
      selection.rangeCount === 0
    ) {
      return void 0;
    }

    this.view.dom.dispatchEvent(
      new CustomEvent<ViewEventDetails>('viewselectionchange', {
        detail: { type: 'viewselectionchange', range: selection.getRangeAt(0) },
        bubbles: true,
        cancelable: false,
        composed: true
      })
    );
  };

  public static create(view: ContentView): DocEventHandler {
    return new this(view);
  }
}

export default DocEventHandler;

import type ContentView from '../abstracts/contentview';

import EventHandler from './eventhandler';

class DocEventHandler extends EventHandler {
  public override listenForViewDOM(dom: HTMLElement): void {
    // window.document.addEventListener('selectionchange', this.onSelectionChange);
    dom.addEventListener('beforeinput', this.onBeforeInput);

    super.listenForViewDOM(dom);
  }

  public override unlistenForViewDOM(dom: HTMLElement): void {
    // window.document.removeEventListener('selectionchange', this.onSelectionChange);
    dom.removeEventListener('beforeinput', this.onBeforeInput);

    super.unlistenForViewDOM(dom);
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

  private onSelectionChange = (): void => {
    const selection = window.document.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return void 0;
    }
  };

  public static create(view: ContentView): DocEventHandler {
    return new this(view);
  }
}

export default DocEventHandler;

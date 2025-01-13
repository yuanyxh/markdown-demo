import type Editor from './editor';

import type { EditorContextConfig } from '@/types';

import { getPlainData } from './data';

class EditorInput {
  private context: Editor;

  public constructor(config: EditorContextConfig) {
    this.context = config.context;
  }

  /**
   * Listen for any necessary input events.
   *
   * @param el
   */
  public on(el: HTMLElement): void {
    el.addEventListener('blur', this.onBlur);
    el.addEventListener('beforeinput', this.onBeforeInput);

    this.context.root.addEventListener('selectionchange', this.onSelectionChange);
  }

  /**
   * Remove the listener.
   *
   * @param el
   */
  public off(el: HTMLElement): void {
    el.removeEventListener('blur', this.onBlur);
    el.removeEventListener('beforeinput', this.onBeforeInput);

    this.context.root.removeEventListener('selectionchange', this.onSelectionChange);
  }

  private onBlur = (): void => {
    this.context.updateRangeBounds();
  };

  private onBeforeInput = (e: InputEvent): void => {
    e.preventDefault();

    switch (e.inputType) {
      case 'insertText':
      case 'insertReplacementText':
      case 'insertFromYank':
      case 'insertFromDrop':
      case 'insertFromPaste':
      case 'insertLink':
      case 'insertFromPasteAsQuotation':
        this.insertPlainText(e);

        break;
    }
  };

  private onSelectionChange = (): void => {
    if (!this.context.hasFocus) {
      return;
    }

    this.context.updateRangeBounds();
  };

  private insertPlainText(e: InputEvent): void {
    const range = e.getTargetRanges()[0];
    const bounds = this.context.locateSrcPos(range);

    const text = getPlainData(e);

    this.context.dispatch({ type: 'insert', from: bounds.from, to: bounds.to, text });
  }
}

export default EditorInput;

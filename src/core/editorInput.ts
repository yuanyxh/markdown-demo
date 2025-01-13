import type Editor from './editor';

import type { EditorContextConfig, InputHandlerFn } from '@/interfaces';

import { getPlainData } from './data';

interface InputHandler {
  [key: string]: InputHandlerFn;
}

const insertPlainText: InputHandlerFn = function insertPlainText(this: Editor, e) {
  const range = this.locateSrcPos(e.getTargetRanges()[0]);

  const text = getPlainData(e);

  const changed = this.dispatch({ type: 'insert', from: range.from, to: range.to, text });

  if (changed) {
    e.preventDefault();

    if (range.from === range.to) {
      range.from = range.to = range.from + text.length;
    }

    this.dispatch({ type: 'selection', from: range.from, to: range.to });

    return true;
  }

  return false;
};

function setHandlers(handlers: InputHandler): void {
  [
    'insertText',
    'insertReplacementText',
    'insertFromYank',
    'insertFromDrop',
    'insertFromPaste',
    'insertLink',
    'insertFromPasteAsQuotation'
  ].forEach((eventName) => {
    handlers[eventName] = insertPlainText;
  });
}

class EditorInput {
  private context: Editor;

  private handlers: InputHandler = {};

  public constructor(config: EditorContextConfig) {
    this.context = config.context;

    setHandlers(this.handlers);

    this.listenForSelectionChange();
  }

  /**
   * Listen for any necessary input events.
   *
   * @param el
   */
  public on(el: HTMLElement): void {
    el.addEventListener('blur', this.onBlur);
    el.addEventListener('beforeinput', this.onBeforeInput);
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

  private listenForSelectionChange(): void {
    this.context.root.addEventListener('selectionchange', this.onSelectionChange);
  }

  private onBlur = (): void => {
    this.context.updateRangeBounds();
  };

  private onBeforeInput = (e: InputEvent): void => {
    if (this.handlers[e.inputType]) {
      this.handlers[e.inputType].call(this.context, e);
    }
  };

  private onSelectionChange = (): void => {
    if (!this.context.isFocus) {
      return;
    }

    this.context.updateRangeBounds();
  };
}

export default EditorInput;

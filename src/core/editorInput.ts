import type Editor from './editor';

import type { InputHandlerFn } from '@/interfaces';

import { getPlainData } from './data';

interface EditorInputConfig {
  context: Editor;
}

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

function setHandlers(handlers: InputHandler) {
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

  private innerInputing = false;

  public constructor(config: EditorInputConfig) {
    this.context = config.context;

    setHandlers(this.handlers);

    this.listenForSelectionChange();
  }

  public get isInputting() {
    return this.innerInputing;
  }

  public on(el: HTMLElement) {
    el.addEventListener('blur', this.onBlur);
    el.addEventListener('beforeinput', this.onBeforeInput);
  }

  public off(el: HTMLElement) {
    el.removeEventListener('blur', this.onBlur);
    el.removeEventListener('beforeinput', this.onBeforeInput);

    this.context.root.removeEventListener('selectionchange', this.onSelectionChange);
  }

  private listenForSelectionChange() {
    this.context.root.addEventListener('selectionchange', this.onSelectionChange);
  }

  private exec(cb: () => void) {
    this.innerInputing = true;
    cb();
    this.innerInputing = false;
  }

  private onBlur = () => {};

  private onBeforeInput = (e: InputEvent) => {
    if (this.handlers[e.inputType]) {
      this.exec(() => this.handlers[e.inputType].call(this.context, e));
    }
  };

  private onSelectionChange = () => {
    if (this.innerInputing || !this.context.isFocus) {
      return false;
    }
  };
}

export default EditorInput;

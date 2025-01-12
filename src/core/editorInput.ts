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
  const range = this.locate(e.getTargetRanges()[0]);

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
    el.addEventListener('beforeinput', this.onBeforeInput.bind(this));
  }

  public off(el: HTMLElement) {
    el.removeEventListener('beforeinput', this.onBeforeInput.bind(this));

    this.context.root.removeEventListener('selectionchange', this.onSelectionChange.bind(this));
  }

  private listenForSelectionChange() {
    this.context.root.addEventListener('selectionchange', this.onSelectionChange.bind(this));
  }

  private exec(cb: () => void) {
    try {
      this.innerInputing = true;

      cb();
    } catch (error) {
      console.error(error);
    }
  }

  private onBeforeInput(e: InputEvent) {
    if (this.handlers[e.inputType]) {
      this.exec(() => this.handlers[e.inputType].call(this.context, e));
    }
  }

  private onSelectionChange() {
    if (this.innerInputing || !this.context.hasFocus()) {
      return false;
    }

    this.context.checkSelection();
  }

  public static create(config: EditorInputConfig) {
    return new EditorInput(config);
  }
}

export default EditorInput;

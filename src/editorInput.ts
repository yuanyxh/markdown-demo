import type Editor from './editor';

import { getPlainData } from './data';

interface EditorInputConfig {
  context: Editor;
}

interface IInputHandler {
  [key: string]: TInputHandlerFn;
}

const insertPlainText: TInputHandlerFn = function insertPlainText(this: Editor, e) {
  const range = this.souremap.locate(e.getTargetRanges()[0]);

  const text = getPlainData(e);

  const changed = this.dispatch({ type: 'insert', from: range.from, to: range.to, text });

  if (changed) {
    e.preventDefault();

    if (range.from === range.to) {
      range.from = range.to = range.from + text.length;
    }

    this.docSelection.updateSelection({ from: range.from, to: range.to });

    return true;
  }

  return false;
};

function setHandlers(handlers: IInputHandler) {
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

  private handlers: IInputHandler = {};

  private innerInputing = false;
  private timerId: number | null = null;

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
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }

    try {
      this.innerInputing = true;

      cb();
    } catch (error) {
      console.error(error);
    }

    this.timerId = window.setTimeout(() => {
      this.timerId = null;
      this.innerInputing = false;
    }, 0);
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

    const selection = this.context.root.getSelection();

    if (selection) {
      const range = selection.getRangeAt(0);
      const { from, to } = this.context.souremap.locate(range);

      console.log(range);
      console.log(from, to, this.context.source.charAt(from), this.context.source.charAt(to));
      console.log(this.context.source.lineAt(from), this.context.source.lineAt(to));

      this.exec(() => this.context.docSelection.updateSelection({ from, to }));
    }
  }

  public static create(config: EditorInputConfig) {
    return new EditorInput(config);
  }
}

export default EditorInput;

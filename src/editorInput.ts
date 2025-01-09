import type { Editor } from './main';

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

  public constructor(config: EditorInputConfig) {
    this.context = config.context;

    setHandlers(this.handlers);
  }

  public on(el: HTMLElement) {
    el.addEventListener('beforeinput', this.onBeforeInput.bind(this));
  }

  public off(el: HTMLElement) {
    el.removeEventListener('beforeinput', this.onBeforeInput.bind(this));
  }

  private onBeforeInput(e: InputEvent) {
    if (this.handlers[e.inputType]) {
      this.handlers[e.inputType].call(this.context, e);
    }
  }

  public static create(config: EditorInputConfig) {
    return new EditorInput(config);
  }
}

export default EditorInput;

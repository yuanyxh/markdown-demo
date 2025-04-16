import type EditorContext from './EditorContext';

import { defaultEditorEvnetHandler } from './editorEventHandler';
import { MarkdownNodeUtils } from './utils';

export interface EditorEventHandlerFn {
  (e: InputEvent, context: EditorContext): any;
}

export type EditorEventHandler = {
  [key in InputType]?: EditorEventHandlerFn;
};

class EditorEvent {
  private context: EditorContext;
  private eventHandler: EditorEventHandler = Object.assign(
    Object.create(null),
    defaultEditorEvnetHandler
  );

  constructor(context: EditorContext) {
    this.context = context;
  }

  private onBeforeInput = (e: InputEvent) => {
    e.preventDefault();
    this.eventHandler[e.inputType as InputType]?.(e, this.context);
  };

  private onSelectionChange = () => {
    const selection = window.document.getSelection();

    if (window.document.activeElement !== this.context.docView.dom || !selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const startView = MarkdownNodeUtils.getView(range.startContainer);

    const start = startView?.locateSrcPos(range.startContainer, range.startOffset) ?? -1;

    if (start !== -1 && range.collapsed) {
      return this.context.cursor.updateSelection({ start: start, end: start });
    }

    const endView = MarkdownNodeUtils.getView(range.endContainer);
    const end = endView?.locateSrcPos(range.endContainer, range.endOffset) ?? -1;
    if (end !== -1) {
      this.context.cursor.updateSelection({ start: start, end: end });
    }
  };

  setEventHandler(eventHandler: EditorEventHandler) {
    for (const key in eventHandler) {
      this.eventHandler[key as InputType] = eventHandler[key as InputType];
    }

    return this;
  }

  listen(): this {
    this.context.docView.dom.addEventListener('beforeinput', this.onBeforeInput);
    window.document.addEventListener('selectionchange', this.onSelectionChange);

    return this;
  }

  unListen(): this {
    this.context.docView.dom.removeEventListener('beforeinput', this.onBeforeInput);
    window.document.removeEventListener('selectionchange', this.onSelectionChange);

    return this;
  }
}

export default EditorEvent;

import type EditorContext from './EditorContext';
import type DocView from './views/docview';

export interface EditorEventHandlerFn {
  (e: InputEvent, context: EditorContext): any;
}

export type EditorEventHandler = {
  [key in InputType]?: EditorEventHandlerFn;
};

class EditorEvent {
  private context: EditorContext;
  private eventHandler: EditorEventHandler = Object.create(null);

  constructor(context: EditorContext) {
    this.context = context;
  }

  private onBeforeInput = (e: InputEvent) => {
    e.preventDefault();

    this.eventHandler[e.inputType as InputType]?.(e, this.context);
  };

  setEventHandler(eventHandler: EditorEventHandler) {
    for (const key in eventHandler) {
      this.eventHandler[key as InputType] = eventHandler[key as InputType];
    }

    return this;
  }

  listenForView(view: DocView): this {
    view.dom.addEventListener('beforeinput', this.onBeforeInput);

    return this;
  }

  unListenForView(view: DocView): this {
    view.dom.removeEventListener('beforeinput', this.onBeforeInput);

    return this;
  }
}

export default EditorEvent;

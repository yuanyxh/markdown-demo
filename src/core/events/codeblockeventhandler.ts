import ContentView from '@/views/abstracts/contentview';

class CodeBlockHandler {
  private view: ContentView;

  public constructor(view: ContentView) {
    this.view = view;
  }

  public listenForCodeBlockViewDOM(dom: HTMLElement): void {
    dom.addEventListener('beforeinput', this.onBeforeInput);
  }

  public unlistenForCodeBlockViewDOM(dom: HTMLElement): void {
    dom.removeEventListener('beforeinput', this.onBeforeInput);
  }

  private onBeforeInput = (e: InputEvent): void => {
    e.stopPropagation();
  };

  public static create(view: ContentView): CodeBlockHandler {
    return new this(view);
  }
}

export default CodeBlockHandler;

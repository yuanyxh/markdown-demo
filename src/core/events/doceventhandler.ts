import type ContentView from '@/views/abstracts/contentview';

class DocEventHandler {
  private view: ContentView;

  public constructor(view: ContentView) {
    this.view = view;
  }

  public listenForViewDOM(dom: HTMLElement): void {
    dom.addEventListener('beforeinput', this.onBeforeInput);
  }

  public unlistenForViewDOM(dom: HTMLElement): void {
    dom.removeEventListener('beforeinput', this.onBeforeInput);
  }

  private onBeforeInput = (e: InputEvent): void => {
    // e.preventDefault();

    console.log(e.inputType, e.getTargetRanges()[0]);
  };

  public static create(view: ContentView): DocEventHandler {
    return new this(view);
  }
}

export default DocEventHandler;

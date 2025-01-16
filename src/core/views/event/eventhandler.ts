import ContentView from '@/views/abstracts/contentview';

class EventHandler {
  protected view: ContentView;

  public constructor(binding: ContentView) {
    this.view = binding;
  }

  public listenForViewDOM(dom: HTMLElement): void {
    dom.addEventListener('modify', this.onEventProxy);
    dom.addEventListener('selectionenter', this.onEventProxy);
    dom.addEventListener('selectionleave', this.onEventProxy);
  }

  public unlistenForViewDOM(dom: HTMLElement): void {
    dom.removeEventListener('modify', this.onEventProxy);
    dom.removeEventListener('selectionenter', this.onEventProxy);
    dom.removeEventListener('selectionleave', this.onEventProxy);
  }

  protected shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return this.view.shouldHandleEvent(e);
  }

  protected onEventProxy = (e: CustomEvent<ViewEventDetails>): void => {
    if (!this.shouldHandleEvent(e)) {
      return void 0;
    }

    console.log(e.type, e.detail, this.view);
    e.stopPropagation();

    switch (e.type) {
      case 'modify':
        this.onModify(e);

        break;

      case 'selectionenter':
        this.onSelectionEnter(e);

        break;

      case 'selectionleave':
        this.onSelectionLeave(e);

        break;

      default:
        break;
    }
  };

  protected onModify(e: CustomEvent<ViewEventDetails>): void {}

  protected onSelectionEnter(e: CustomEvent<ViewEventDetails>): void {}

  protected onSelectionLeave(e: CustomEvent<ViewEventDetails>): void {}

  public static create(view: ContentView): EventHandler {
    return new this(view);
  }
}

export default EventHandler;

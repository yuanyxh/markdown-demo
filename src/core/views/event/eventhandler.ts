import ContentView from '@/views/abstracts/contentview';

class EventHandler {
  protected view: ContentView;

  public constructor(binding: ContentView) {
    this.view = binding;
  }

  public listenForViewDOM(dom: HTMLElement): void {
    dom.addEventListener('modify', this.onAnyViewEventProxy);
    dom.addEventListener('viewselectionchange', this.onAnyViewEventProxy, { capture: true });
  }

  public unlistenForViewDOM(dom: HTMLElement): void {
    dom.removeEventListener('modify', this.onAnyViewEventProxy);
    dom.removeEventListener('viewselectionchange', this.onAnyViewEventProxy, { capture: true });
  }

  protected shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return this.view.shouldHandleEvent(e);
  }

  protected onAnyViewEventProxy = (e: CustomEvent<ViewEventDetails>): void => {
    if (!this.shouldHandleEvent(e)) {
      return void 0;
    }

    console.log(e.type, e.detail, this.view);
    e.stopPropagation();

    switch (e.type) {
      case 'modify':
        this.onModify(e);

        break;

      case 'viewselectionchange':
        this.onViewSelectionChange(e);

        break;

      default:
        break;
    }
  };

  protected onModify(e: CustomEvent<ViewEventDetails>): void {}

  protected onViewSelectionChange(e: CustomEvent<ViewEventDetails>): void {}

  public static create(view: ContentView): EventHandler {
    return new this(view);
  }
}

export default EventHandler;

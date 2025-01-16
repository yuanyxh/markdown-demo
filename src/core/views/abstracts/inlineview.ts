import ContentView from './contentview';

abstract class InlineView extends ContentView {
  public abstract children: InlineView[];

  public override locatePosFromDOM(dom: Node, offset: number): number {
    if (!this.dom.contains(dom)) {
      return -1;
    }

    if ((dom === this.dom || dom.parentNode === this.dom) && dom.nodeType === 3) {
      return this.posAtStart + offset;
    }

    return super.locatePosFromDOM(dom, offset);
  }

  public override shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return e.type !== 'modify' && super.shouldHandleEvent(e);
  }
}

export default InlineView;

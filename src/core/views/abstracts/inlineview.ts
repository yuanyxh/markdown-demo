import ContentView from './contentview';

abstract class InlineView extends ContentView {
  public abstract children: InlineView[];

  public override shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return (
      e.type === 'viewselectionchange' &&
      (this.dom.contains(e.detail.range.startContainer) ||
        this.dom.contains(e.detail.range.endContainer))
    );
  }
}

export default InlineView;

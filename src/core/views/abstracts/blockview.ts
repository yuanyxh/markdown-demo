import ContentView from './contentview';

abstract class BlockView extends ContentView {
  public override shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return (
      e.type === 'modify' &&
      this.dom.contains(e.detail.range.startContainer) &&
      this.dom.contains(e.detail.range.endContainer)
    );
  }
}

export default BlockView;

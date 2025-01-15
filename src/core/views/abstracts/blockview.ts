import ContentView from './contentview';

abstract class BlockView extends ContentView {
  public override locatePosFromDOM(dom: Node, offset: number): number {
    if (!this.dom.contains(dom)) {
      return -1;
    }

    if (dom === this.dom) {
      const position = Math.max(0, offset - 1);
      let view: ContentView | null;
      if ((view = ContentView.get(dom.childNodes[position]))) {
        return offset === 0 ? view.posAtStart : Math.min(this.node.inputEndIndex, this.posAtEnd);
      }
    }

    return super.locatePosFromDOM(dom, offset);
  }
}

export default BlockView;

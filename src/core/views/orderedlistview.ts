import type { OrderedList } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';

class OrderedListView extends BlockView {
  public length: number = 0;
  public children: BlockView[] = [];
  public node: OrderedList;

  public constructor(node: OrderedList) {
    super(node);

    this.node = node;
  }

  public override eq(node: OrderedList): boolean {
    return (
      node.type === this.node.type &&
      node.getMarkerDelimiter() === this.node.getMarkerDelimiter() &&
      node.getMarkerStartNumber() === this.node.getMarkerStartNumber()
    );
  }

  protected override createElement(node: OrderedList): HTMLElement {
    const ol = window.document.createElement('ol');

    const startNumber = node.getMarkerStartNumber();

    if (typeof startNumber === 'number') {
      ol.start = startNumber;
    }

    return ol;
  }

  public static override craete(node: OrderedList): OrderedListView {
    return new this(node);
  }
}

export default OrderedListView;

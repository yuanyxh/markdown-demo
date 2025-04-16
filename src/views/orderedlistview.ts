import type { OrderedList } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ListItemView from './listitemview';

import BlockView from './abstracts/blockview';

class OrderedListView extends BlockView {
  children: ListItemView[] = [];
  node: OrderedList;

  constructor(node: OrderedList, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: OrderedList): boolean {
    return (
      node.type === this.node.type &&
      node.getMarkerDelimiter() === this.node.getMarkerDelimiter() &&
      node.getMarkerStartNumber() === this.node.getMarkerStartNumber()
    );
  }

  protected override createElement(node: OrderedList): HTMLOListElement {
    const ol = window.document.createElement('ol');

    const startNumber = node.getMarkerStartNumber();

    if (typeof startNumber === 'number') {
      ol.start = startNumber;
    }

    return ol;
  }
}

export default OrderedListView;

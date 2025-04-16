import type { BulletList } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ListItemView from './listitemview';

import BlockView from './abstracts/blockview';

class BulletListView extends BlockView {
  children: ListItemView[] = [];
  node: BulletList;

  constructor(node: BulletList, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: BulletList): boolean {
    return (
      node.type === this.node.type &&
      node.getMarker() === this.node.getMarker() &&
      node.isTight() === this.node.isTight()
    );
  }

  protected override createElement(): HTMLUListElement {
    return window.document.createElement('ul');
  }
}

export default BulletListView;

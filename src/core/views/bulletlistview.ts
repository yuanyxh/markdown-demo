import type { BulletList } from 'commonmark-java-js';

import type ListItemView from './listitemview';

import BlockView from './abstracts/blockview';

class BulletListView extends BlockView {
  public length: number = 0;
  public children: ListItemView[] = [];
  public node: BulletList;

  public constructor(node: BulletList) {
    super(node);

    this.node = node;
  }

  public override eq(node: BulletList): boolean {
    return (
      node.type === this.node.type &&
      node.getMarker() === this.node.getMarker() &&
      node.isTight() === this.node.isTight()
    );
  }

  protected override createElement(): HTMLUListElement {
    return window.document.createElement('ul');
  }

  public static override craete(node: BulletList): BulletListView {
    return new this(node);
  }
}

export default BulletListView;

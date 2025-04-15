import type { ListItem } from 'commonmark-java-js';

import BlockView from './abstracts/blockview';

class ListItemView extends BlockView {
  public children: BlockView[] = [];
  public node: ListItem;

  public constructor(node: ListItem) {
    super(node);

    this.node = node;
  }

  public override eq(node: ListItem): boolean {
    return node.type === this.node.type && node.getMarkerIndent() === this.node.getMarkerIndent();
  }

  protected override createElement(): HTMLLIElement {
    return window.document.createElement('li');
  }

  public static override craete(node: ListItem): ListItemView {
    return new this(node);
  }
}

export default ListItemView;

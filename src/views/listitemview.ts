import type { ListItem } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import BlockView from './abstracts/blockview';

class ListItemView extends BlockView {
  children: BlockView[] = [];
  node: ListItem;

  constructor(node: ListItem, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: ListItem): boolean {
    return node.type === this.node.type && node.getMarkerIndent() === this.node.getMarkerIndent();
  }

  protected override createElement(): HTMLLIElement {
    return window.document.createElement('li');
  }

  static override craete(node: ListItem, context: EditorContext): ListItemView {
    return new this(node, context);
  }
}

export default ListItemView;

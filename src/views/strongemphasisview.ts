import type { StrongEmphasis } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class StrongEmphasisView extends InlineView {
  children: ContentView[] = [];
  node: StrongEmphasis;

  constructor(node: StrongEmphasis, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: StrongEmphasis): boolean {
    return (
      node.type === this.node.type &&
      node.getOpeningDelimiter() === this.node.getOpeningDelimiter() &&
      node.getClosingDelimiter() === this.node.getClosingDelimiter()
    );
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('strong');
  }

  static override craete(node: StrongEmphasis, context: EditorContext): StrongEmphasisView {
    return new this(node, context);
  }
}

export default StrongEmphasisView;

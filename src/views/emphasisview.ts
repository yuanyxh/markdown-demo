import type { Emphasis } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class EmphasisView extends InlineView {
  children: ContentView[] = [];
  node: Emphasis;

  constructor(node: Emphasis, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: Emphasis): boolean {
    return (
      node.type === this.node.type &&
      node.getOpeningDelimiter() === this.node.getOpeningDelimiter() &&
      node.getClosingDelimiter() === this.node.getClosingDelimiter()
    );
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('em');
  }

  static override craete(node: Emphasis, context: EditorContext): EmphasisView {
    return new this(node, context);
  }
}

export default EmphasisView;

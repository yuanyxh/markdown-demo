import type { Emphasis } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class EmphasisView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: Emphasis;

  public constructor(node: Emphasis) {
    super(node);

    this.node = node;
  }

  public override eq(node: Emphasis): boolean {
    return (
      node.type === this.node.type &&
      node.getOpeningDelimiter() === this.node.getOpeningDelimiter() &&
      node.getClosingDelimiter() === this.node.getClosingDelimiter()
    );
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('em');
  }

  public static override craete(node: Emphasis): EmphasisView {
    return new this(node);
  }
}

export default EmphasisView;

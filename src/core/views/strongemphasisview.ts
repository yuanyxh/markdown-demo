import type { StrongEmphasis } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class StrongEmphasisView extends InlineView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: StrongEmphasis;

  public constructor(node: StrongEmphasis) {
    super(node);

    this.node = node;
  }

  public override eq(node: StrongEmphasis): boolean {
    return (
      node.type === this.node.type &&
      node.getOpeningDelimiter() === this.node.getOpeningDelimiter() &&
      node.getClosingDelimiter() === this.node.getClosingDelimiter()
    );
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('strong');
  }

  public static override craete(node: StrongEmphasis): StrongEmphasisView {
    return new this(node);
  }
}

export default StrongEmphasisView;

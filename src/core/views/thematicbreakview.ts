import type { ThematicBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class ThematicBreakView extends BlockView {
  public length: number = 0;
  public children: ContentView[] = [];
  public node: ThematicBreak;

  public constructor(node: ThematicBreak) {
    super(node);

    this.node = node;
  }

  public override eq(node: ThematicBreak): boolean {
    return node.type === this.node.type && node.getLiteral() === this.node.getLiteral();
  }

  protected override createElement(): HTMLElement {
    return window.document.createElement('hr');
  }

  public static override craete(node: ThematicBreak): ThematicBreakView {
    return new this(node);
  }
}

export default ThematicBreakView;

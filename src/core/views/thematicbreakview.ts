import type { ThematicBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class ThematicBreakView extends BlockView {
  public length: number = 0;
  public children: ContentView[] = [];

  protected override createElement(): HTMLHRElement {
    return window.document.createElement('hr');
  }

  public static override craete(node: ThematicBreak): ThematicBreakView {
    return new this(node);
  }
}

export default ThematicBreakView;

import type { ThematicBreak } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class ThematicBreakView extends BlockView {
  public children: ContentView[] = [];

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(): HTMLDivElement {
    const wrapper = window.document.createElement('div');
    wrapper.contentEditable = 'false';

    const hr = window.document.createElement('hr');
    wrapper.appendChild(hr);

    return wrapper;
  }

  public static override craete(node: ThematicBreak): ThematicBreakView {
    return new this(node);
  }
}

export default ThematicBreakView;

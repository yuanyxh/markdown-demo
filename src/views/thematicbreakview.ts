import type { ThematicBreak } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import BlockView from './abstracts/blockview';

class ThematicBreakView extends BlockView {
  children: ContentView[] = [];

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(): HTMLDivElement {
    const wrapper = window.document.createElement('div');
    wrapper.contentEditable = 'false';

    const hr = window.document.createElement('hr');
    wrapper.appendChild(hr);

    return wrapper;
  }

  static override craete(node: ThematicBreak, context: EditorContext): ThematicBreakView {
    return new this(node, context);
  }
}

export default ThematicBreakView;

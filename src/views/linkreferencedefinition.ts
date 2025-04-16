import type { LinkReferenceDefinition } from 'commonmark-java-js';
import type EditorContext from '../EditorContext';
import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class LinkReferenceDefinitionView extends InlineView {
  children: ContentView[] = [];
  node: LinkReferenceDefinition;

  constructor(node: LinkReferenceDefinition, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: LinkReferenceDefinition): HTMLParagraphElement {
    const wrapper = window.document.createElement('p');

    wrapper.textContent = 'link referencedefinition: ' + node.getDestination();

    return wrapper;
  }
}

export default LinkReferenceDefinitionView;

import type { LinkReferenceDefinition } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class LinkReferenceDefinitionView extends InlineView {
  children: ContentView[] = [];
  node: LinkReferenceDefinition;

  constructor(node: LinkReferenceDefinition) {
    super(node);

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

  static override craete(node: LinkReferenceDefinition): LinkReferenceDefinitionView {
    return new this(node);
  }
}

export default LinkReferenceDefinitionView;

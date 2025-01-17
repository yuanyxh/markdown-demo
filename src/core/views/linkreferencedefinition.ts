import type { LinkReferenceDefinition } from 'commonmark-java-js';

import type ContentView from './abstracts/contentview';

import InlineView from './abstracts/inlineview';

class LinkReferenceDefinitionView extends InlineView {
  public children: ContentView[] = [];
  public node: LinkReferenceDefinition;

  public constructor(node: LinkReferenceDefinition) {
    super(node);

    this.node = node;
  }

  public override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: LinkReferenceDefinition): HTMLParagraphElement {
    const wrapper = window.document.createElement('p');

    wrapper.innerHTML = `<span>[</span><span>${node.getLabel()}</span><span>]:</span> <span>${node.getDestination()}</span>&nbsp;<span>"</span><span>${node.getTitle()}</span><span>"</span>`;

    return wrapper;
  }

  public static override craete(node: LinkReferenceDefinition): LinkReferenceDefinitionView {
    return new this(node);
  }
}

export default LinkReferenceDefinitionView;

import type ContentView from './abstracts/contentview';
import type EditorContext from '../EditorContext';
import { AbstractVisitor, Image, HardLineBreak, SoftLineBreak, Text } from 'commonmark-java-js';

import InlineView from './abstracts/inlineview';

class AltTextVisitor extends AbstractVisitor {
  private altText = '';

  getAltText() {
    return this.altText;
  }

  visit(node: Image | Text | SoftLineBreak | HardLineBreak) {
    switch (true) {
      case node instanceof Image:
        this.visitChildren(node);

        break;

      case node instanceof Text:
        this.altText += node.getLiteral();

        break;

      case node instanceof HardLineBreak:
      case node instanceof SoftLineBreak:
        this.altText += '\n';

        break;
    }
  }
}

class ImageView extends InlineView {
  children: ContentView[] = [];
  node: Image;

  constructor(node: Image, context: EditorContext) {
    super(node, context);

    this.node = node;
  }

  override eq(node: Image): boolean {
    return node.type === this.node.type && node.getDestination() === this.node.getDestination();
  }

  override isOpend(): boolean {
    return false;
  }

  protected override createElement(node: Image): HTMLImageElement {
    const image = window.document.createElement('img');
    image.src = node.getDestination();

    if (node.getTitle()) {
      image.title = node.getTitle() || '';
    }

    const altTextVisitor = new AltTextVisitor();
    node.accept(altTextVisitor);

    if (altTextVisitor.getAltText()) {
      image.alt = altTextVisitor.getAltText();
    }

    return image;
  }

  static override craete(node: Image, context: EditorContext): ImageView {
    return new this(node, context);
  }
}

export default ImageView;

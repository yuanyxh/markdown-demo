import type ContentView from './abstracts/contentview';

import { AbstractVisitor, Image, HardLineBreak, SoftLineBreak, Text } from 'commonmark-java-js';

import InlineView from './abstracts/inlineview';

class AltTextVisitor extends AbstractVisitor {
  private altText = '';

  public getAltText() {
    return this.altText;
  }

  public visit(node: Image | Text | SoftLineBreak | HardLineBreak) {
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
  public children: ContentView[] = [];
  public node: Image;

  public constructor(node: Image) {
    super(node);

    this.node = node;
  }

  public override eq(node: Image): boolean {
    return node.type === this.node.type && node.getDestination() === this.node.getDestination();
  }

  public override isOpend(): boolean {
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

  public static override craete(node: Image): ImageView {
    return new this(node);
  }
}

export default ImageView;

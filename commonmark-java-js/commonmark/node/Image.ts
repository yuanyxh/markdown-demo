import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Image extends Node {
  private destination = '';
  private title: string | undefined;

  constructor(destination = '', title?: string) {
    super('image');

    this.destination = destination;
    this.title = title;
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  getDestination(): string {
    return this.destination;
  }

  setDestination(destination: string) {
    this.destination = destination;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  setTitle(title?: string) {
    this.title = title;
  }

  protected toStringAttributes(): string {
    return 'destination=' + this.destination + ', title=' + this.title;
  }
}

export default Image;

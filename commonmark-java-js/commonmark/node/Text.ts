import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Text extends Node {
  private literal: string;

  constructor(literal: string) {
    super('text');

    this.literal = literal;
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  getLiteral(): string {
    return this.literal;
  }

  setLiteral(literal: string) {
    this.literal = literal;
  }

  protected toStringAttributes(): string {
    return 'literal=' + this.literal;
  }
}

export default Text;

import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Code extends Node {
  private literal: string;

  constructor(literal = '') {
    super('code');

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
}

export default Code;

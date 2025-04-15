import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Code extends Node {
  private literal: string;

  public constructor(literal = '') {
    super('code');

    this.literal = literal;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default Code;

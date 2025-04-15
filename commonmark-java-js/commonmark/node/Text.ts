import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Text extends Node {
  private literal: string;

  public constructor(literal: string) {
    super('text');

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

  protected toStringAttributes(): string {
    return 'literal=' + this.literal;
  }
}

export default Text;

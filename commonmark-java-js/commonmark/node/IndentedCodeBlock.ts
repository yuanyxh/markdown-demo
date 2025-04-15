import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

class IndentedCodeBlock extends Block {
  private literal = '';

  constructor() {
    super('indented-code-block');
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

export default IndentedCodeBlock;

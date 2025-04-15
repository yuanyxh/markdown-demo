import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

/**
 * HTML block
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#html-blocks">CommonMark Spec</a>
 */
class HtmlBlock extends Block {
  private literal = '';

  constructor() {
    super('html-block');
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

export default HtmlBlock;

import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

/**
 * Inline HTML element.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#raw-html">CommonMark Spec</a>
 */
class HtmlInline extends Node {
  private literal = '';

  constructor() {
    super('html-inline');
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

export default HtmlInline;

import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

/**
 * A paragraph block, contains inline nodes such as {@link Text}
 */
class Paragraph extends Block {
  constructor() {
    super('paragraph');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Paragraph;

import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

class BlockQuote extends Block {
  constructor() {
    super('blockquote');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default BlockQuote;

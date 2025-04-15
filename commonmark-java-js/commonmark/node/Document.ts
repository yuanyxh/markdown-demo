import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

class Document extends Block {
  constructor() {
    super('document');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Document;

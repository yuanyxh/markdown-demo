import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class SoftLineBreak extends Node {
  constructor() {
    super('softline-break');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default SoftLineBreak;

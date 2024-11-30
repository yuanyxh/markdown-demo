import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

class BlockQuote extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default BlockQuote;

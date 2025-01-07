import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

class BlockQuote extends Block {
  public constructor() {
    super("blockquote");
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default BlockQuote;

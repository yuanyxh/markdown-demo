import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 块引用
 */
class BlockQuote extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default BlockQuote;

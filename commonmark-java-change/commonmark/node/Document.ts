import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 文档
 */
class Document extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Document;

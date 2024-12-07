import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 包含内联内容的段落块
 *
 * A paragraph block, contains inline nodes such as {@link Text}
 */
class Paragraph extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Paragraph;

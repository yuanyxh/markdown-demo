import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class SoftLineBreak extends MarkdownNode {
  public constructor() {
    super("softline-break");
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default SoftLineBreak;

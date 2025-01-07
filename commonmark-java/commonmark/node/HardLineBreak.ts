import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class HardLineBreak extends MarkdownNode {
  public constructor() {
    super("hardline-break");
  }

  public override accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default HardLineBreak;

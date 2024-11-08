import type { Visitor } from "./interfaces/Visitor";

import Node from "./abstracts/Node";

class HardLineBreak extends Node {
  public override accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default HardLineBreak;

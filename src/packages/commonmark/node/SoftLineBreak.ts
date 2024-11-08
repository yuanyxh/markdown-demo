import type { Visitor } from "./interfaces/Visitor";

import Node from "./abstracts/Node";

class SoftLineBreak extends Node {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default SoftLineBreak;

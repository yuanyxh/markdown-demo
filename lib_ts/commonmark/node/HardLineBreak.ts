import Node from "./Node";
import { Visitor } from "./Visitor";

class HardLineBreak extends Node {
  public accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default HardLineBreak;

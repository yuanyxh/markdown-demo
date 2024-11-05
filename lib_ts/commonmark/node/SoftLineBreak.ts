import Node from "./Node";
import { Visitor } from "./Visitor";

class SoftLineBreak extends Node {
  public accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default SoftLineBreak;

import Node from "./Node";
import { Visitor } from "./Visitor";

abstract class CustomNode extends Node {
  public accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default CustomNode;

import Block from "./Block";
import { Visitor } from "./Visitor";

abstract class CustomBlock extends Block {
  public accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default CustomBlock;

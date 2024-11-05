import Block from "./Block";
import { Visitor } from "./Visitor";

class BlockQuote extends Block {
  public accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

export default BlockQuote;

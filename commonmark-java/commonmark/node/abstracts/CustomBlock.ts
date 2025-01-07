import type { Visitor } from "../interfaces/Visitor";

import Block from "./Block";

abstract class CustomBlock extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default CustomBlock;

import type { Visitor } from "../interfaces/Visitor";

import Block from "./Block";

/**
 * 自定义块的共同抽象类
 */
abstract class CustomBlock extends Block {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default CustomBlock;

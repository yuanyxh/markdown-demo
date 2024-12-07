import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 缩进代码块
 */
class IndentedCodeBlock extends Block {
  private literal = "";

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取缩进代码块的内容
   *
   * @returns
   */
  public getLiteral(): string {
    return this.literal;
  }

  /**
   * 设置缩进代码块的内容
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default IndentedCodeBlock;

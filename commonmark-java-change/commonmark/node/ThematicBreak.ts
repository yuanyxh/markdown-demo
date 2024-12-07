import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 主题分割块
 */
class ThematicBreak extends Block {
  private literal: string | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 表示此节点的源文字（如果可用）
   *
   * @return the source literal that represents this node, if available
   */
  public getLiteral(): string | undefined {
    return this.literal;
  }

  /**
   * 设置表示此节点的源文字（如果可用）
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default ThematicBreak;

import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * 文本节点
 */
class Text extends MarkdownNode {
  private literal: string;

  public constructor(literal: string) {
    super();

    this.literal = literal;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取文本内容
   *
   * @returns
   */
  public getLiteral(): string {
    return this.literal;
  }

  /**
   * 设置文本内容
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }

  protected toStringAttributes(): string {
    return "literal=" + this.literal;
  }
}

export default Text;

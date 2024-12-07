import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * 代码
 */
class Code extends MarkdownNode {
  private literal: string;

  public constructor(literal = "") {
    super();

    this.literal = literal;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取代码文本
   *
   * @returns
   */
  public getLiteral(): string {
    return this.literal;
  }

  /**
   * 设置代码文本
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default Code;

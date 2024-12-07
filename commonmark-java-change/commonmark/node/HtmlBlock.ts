import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * HTML block
 *
 * html 块
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#html-blocks">CommonMark Spec</a>
 */
class HtmlBlock extends Block {
  private literal = "";

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取 html 块的内容
   *
   * @returns
   */
  public getLiteral(): string {
    return this.literal;
  }

  /**
   * 设置 html 块的内容
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default HtmlBlock;

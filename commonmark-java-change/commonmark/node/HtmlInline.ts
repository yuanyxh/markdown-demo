import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * Inline HTML element.
 *
 * html 内联
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#raw-html">CommonMark Spec</a>
 */
class HtmlInline extends MarkdownNode {
  private literal = "";

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取 html 内联内容
   *
   * @returns
   */
  public getLiteral(): string {
    return this.literal;
  }

  /**
   * 设置 html 内联内容
   *
   * @param literal
   */
  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default HtmlInline;

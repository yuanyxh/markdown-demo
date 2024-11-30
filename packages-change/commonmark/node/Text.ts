import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class Text extends MarkdownNode {
  private literal: string;

  public constructor(literal: string) {
    super();
    this.literal = literal;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }

  protected toStringAttributes(): string {
    return "literal=" + this.literal;
  }
}

export default Text;

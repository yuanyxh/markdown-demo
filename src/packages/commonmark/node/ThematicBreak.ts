import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

class ThematicBreak extends Block {
  private literal: string | undefined;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the source literal that represents this node, if available
   */
  public getLiteral(): string | undefined {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default ThematicBreak;

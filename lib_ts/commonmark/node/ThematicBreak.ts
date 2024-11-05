import Block from "./Block";
import { Visitor } from "./Visitor";

class ThematicBreak extends Block {
  private literal = "";

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the source literal that represents this node, if available
   */
  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default ThematicBreak;

import Node from "./Node";
import { Visitor } from "./Visitor";

class Text extends Node {
  private literal: string;

  public constructor(literal: string) {
    super();
    this.literal = literal;
  }

  public accept(visitor: Visitor) {
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

import Node from "./Node";
import { Visitor } from "./Visitor";

class Code extends Node {
  private literal: string;

  public constructor(literal = "") {
    super();

    this.literal = literal;
  }

  public accept(visitor: Visitor): void {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default Code;

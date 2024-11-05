import { Visitor } from "./Visitor";
import Block from "./Block";

class IndentedCodeBlock extends Block {
  private literal = "";

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getLiteral(): string {
    return this.literal;
  }

  public setLiteral(literal: string) {
    this.literal = literal;
  }
}

export default IndentedCodeBlock;

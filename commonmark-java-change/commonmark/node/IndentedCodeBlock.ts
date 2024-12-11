import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

class IndentedCodeBlock extends Block {
  private literal = "";

  public constructor() {
    super("indented-code-block");
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
}

export default IndentedCodeBlock;

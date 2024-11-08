import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

class Heading extends Block {
  private level = -1;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getLevel(): number {
    return this.level;
  }

  public setLevel(level: number) {
    this.level = level;
  }
}

export default Heading;

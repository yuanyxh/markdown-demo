import { Visitor } from "./Visitor";
import Block from "./Block";

class Heading extends Block {
  private level = -1;

  public accept(visitor: Visitor) {
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

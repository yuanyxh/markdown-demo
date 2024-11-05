import Block from "./Block";
import { Visitor } from "./Visitor";

class Document extends Block {
  public accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Document;

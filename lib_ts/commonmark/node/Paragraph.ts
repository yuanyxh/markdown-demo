import Block from "./Block";
import { Visitor } from "./Visitor";

/**
 * A paragraph block, contains inline nodes such as {@link Text}
 */
class Paragraph extends Block {
  public accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Paragraph;

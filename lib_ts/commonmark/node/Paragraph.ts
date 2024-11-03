
import { java } from "jree";



/**
 * A paragraph block, contains inline nodes such as {@link Text}
 */
export  class Paragraph extends Block {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

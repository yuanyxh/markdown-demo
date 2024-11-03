
import { java } from "jree";



export  class BlockQuote extends Block {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

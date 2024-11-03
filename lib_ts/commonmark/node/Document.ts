
import { java } from "jree";



export  class Document extends Block {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

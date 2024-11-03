
import { java } from "jree";



export  class SoftLineBreak extends Node {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

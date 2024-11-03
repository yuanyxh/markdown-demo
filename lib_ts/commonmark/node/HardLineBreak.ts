
import { java } from "jree";



export  class HardLineBreak extends Node {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

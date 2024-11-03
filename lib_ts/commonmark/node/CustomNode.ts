
import { java } from "jree";



export abstract  class CustomNode extends Node {
    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

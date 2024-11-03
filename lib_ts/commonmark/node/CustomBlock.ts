
import { java } from "jree";



export abstract  class CustomBlock extends Block {

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}

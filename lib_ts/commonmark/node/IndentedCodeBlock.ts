
import { java } from "jree";



export  class IndentedCodeBlock extends Block {

    private  literal:  java.lang.String | null;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    public  getLiteral():  java.lang.String | null {
        return this.literal;
    }

    public  setLiteral(literal: java.lang.String| null):  void {
        this.literal = literal;
    }
}

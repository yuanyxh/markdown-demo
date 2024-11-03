
import { java } from "jree";



/**
 * Inline HTML element.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#raw-html">CommonMark Spec</a>
 */
export  class HtmlInline extends Node {

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

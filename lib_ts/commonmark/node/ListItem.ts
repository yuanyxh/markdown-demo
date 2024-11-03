
import { java } from "jree";



export  class ListItem extends Block {

    private  markerIndent:  java.lang.Integer | null;
    private  contentIndent:  java.lang.Integer | null;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    /**
     * Returns the indent of the marker such as "-" or "1." in columns (spaces or tab stop of 4) if available, or null
     * otherwise.
     * <p>
     * Some examples and their marker indent:
     * <pre>- Foo</pre>
     * Marker indent: 0
     * <pre> - Foo</pre>
     * Marker indent: 1
     * <pre>  1. Foo</pre>
     * Marker indent: 2
     */
    public  getMarkerIndent():  java.lang.Integer | null {
        return this.markerIndent;
    }

    public  setMarkerIndent(markerIndent: java.lang.Integer| null):  void {
        this.markerIndent = markerIndent;
    }

    /**
     * Returns the indent of the content in columns (spaces or tab stop of 4) if available, or null otherwise.
     * The content indent is counted from the beginning of the line and includes the marker on the first line.
     * <p>
     * Some examples and their content indent:
     * <pre>- Foo</pre>
     * Content indent: 2
     * <pre> - Foo</pre>
     * Content indent: 3
     * <pre>  1. Foo</pre>
     * Content indent: 5
     * <p>
     * Note that subsequent lines in the same list item need to be indented by at least the content indent to be counted
     * as part of the list item.
     */
    public  getContentIndent():  java.lang.Integer | null {
        return this.contentIndent;
    }

    public  setContentIndent(contentIndent: java.lang.Integer| null):  void {
        this.contentIndent = contentIndent;
    }
}

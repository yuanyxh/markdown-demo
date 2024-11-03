
import { java, JavaObject } from "jree";



export abstract  class ListHolder extends JavaObject {
    private static readonly  INDENT_DEFAULT:  java.lang.String | null = "   ";
    private static readonly  INDENT_EMPTY:  java.lang.String | null = "";

    private readonly  parent:  ListHolder | null;
    private readonly  indent:  java.lang.String | null;

    protected constructor(parent: ListHolder| null) {
        super();
this.parent = parent;

        if (parent !== null) {
            this.indent = parent.indent + ListHolder.INDENT_DEFAULT;
        } else {
            this.indent = ListHolder.INDENT_EMPTY;
        }
    }

    public  getParent():  ListHolder | null {
        return this.parent;
    }

    public  getIndent():  java.lang.String | null {
        return this.indent;
    }
}

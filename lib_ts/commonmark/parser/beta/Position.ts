
import { java, JavaObject, type int } from "jree";



/**
 * Position within a {@link Scanner}. This is intentionally kept opaque so as not to expose the internal structure of
 * the Scanner.
 */
export  class Position extends JavaObject {

    protected readonly  lineIndex:  int;
    protected readonly  index:  int;

    protected constructor(lineIndex: int, index: int) {
        super();
this.lineIndex = lineIndex;
        this.index = index;
    }
}

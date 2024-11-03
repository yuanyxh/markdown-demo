
import { java, type int, type char } from "jree";



export  class OrderedList extends ListBlock {

    private  markerDelimiter:  java.lang.String | null;
    private  markerStartNumber:  java.lang.Integer | null;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    /**
     * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
     */
    public  getMarkerStartNumber():  java.lang.Integer | null {
        return this.markerStartNumber;
    }

    public  setMarkerStartNumber(markerStartNumber: java.lang.Integer| null):  void {
        this.markerStartNumber = markerStartNumber;
    }

    /**
     * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
     */
    public  getMarkerDelimiter():  java.lang.String | null {
        return this.markerDelimiter;
    }

    public  setMarkerDelimiter(markerDelimiter: java.lang.String| null):  void {
        this.markerDelimiter = markerDelimiter;
    }

    /**
     * @deprecated use {@link #getMarkerStartNumber()} instead
     */
    public  getStartNumber():  int {
        return this.markerStartNumber !== null ? this.markerStartNumber : 0;
    }

    /**
     * @deprecated use {@link #setMarkerStartNumber} instead
     */
    public  setStartNumber(startNumber: int):  void {
        this.markerStartNumber = startNumber !== 0 ? startNumber : null;
    }

    /**
     * @deprecated use {@link #getMarkerDelimiter()} instead
     */
    public  getDelimiter():  char {
        return this.markerDelimiter !== null && !this.markerDelimiter.isEmpty() ? this.markerDelimiter.charAt(0) : '\0';
    }

    /**
     * @deprecated use {@link #setMarkerDelimiter} instead
     */
    public  setDelimiter(delimiter: char):  void {
        this.markerDelimiter = delimiter !== '\0' ? java.lang.String.valueOf(delimiter) : null;
    }
}

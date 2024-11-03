
import { java, type char } from "jree";



export  class BulletList extends ListBlock {

    private  marker:  java.lang.String | null;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    /**
     * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
     */
    public  getMarker():  java.lang.String | null {
        return this.marker;
    }

    public  setMarker(marker: java.lang.String| null):  void {
        this.marker = marker;
    }

    /**
     * @deprecated use {@link #getMarker()} instead
     */
    public  getBulletMarker():  char {
        return this.marker !== null && !this.marker.isEmpty() ? this.marker.charAt(0) : '\0';
    }

    /**
     * @deprecated use {@link #getMarker()} instead
     */
    public  setBulletMarker(bulletMarker: char):  void {
        this.marker = bulletMarker !== '\0' ? java.lang.String.valueOf(bulletMarker) : null;
    }
}

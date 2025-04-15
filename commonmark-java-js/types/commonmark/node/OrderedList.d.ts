import type { Visitor } from './interfaces/Visitor';
import ListBlock from './ListBlock';
declare class OrderedList extends ListBlock {
    private markerDelimiter;
    private markerStartNumber;
    constructor();
    accept(visitor: Visitor): void;
    /**
     * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
     */
    getMarkerStartNumber(): number | undefined;
    setMarkerStartNumber(markerStartNumber: number): void;
    /**
     * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
     */
    getMarkerDelimiter(): string | undefined;
    setMarkerDelimiter(markerDelimiter: string): void;
}
export default OrderedList;

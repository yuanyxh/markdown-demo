import type { Visitor } from './interfaces/Visitor';
import ListBlock from './ListBlock';
declare class BulletList extends ListBlock {
    private marker;
    constructor();
    accept(visitor: Visitor): void;
    /**
     * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
     */
    getMarker(): string | undefined;
    /**
     * @param marker
     */
    setMarker(marker?: string): void;
}
export default BulletList;

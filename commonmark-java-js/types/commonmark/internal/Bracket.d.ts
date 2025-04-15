import type Delimiter from './Delimiter';
import type { Text } from '@/node';
import type { Position } from '@/parser';
/**
 * Opening bracket for links ({@code [}), images ({@code ![}), or links with other markers.
 */
declare class Bracket {
    /**
     * The node of a marker such as {@code !} if present, null otherwise.
     */
    readonly markerNode: Text | null;
    /**
     * The position of the marker if present, null otherwise.
     */
    readonly markerPosition: Position | null;
    /**
     * The node of {@code [}.
     */
    readonly bracketNode: Text | null;
    /**
     * The position of {@code [}.
     */
    readonly bracketPosition: Position | null;
    /**
     * The position of the content (after the opening bracket)
     */
    readonly contentPosition: Position | null;
    /**
     * Previous bracket.
     */
    readonly previous: Bracket | null;
    /**
     * Previous delimiter (emphasis, etc) before this bracket.
     */
    readonly previousDelimiter: Delimiter | null;
    /**
     * Whether this bracket is allowed to form a link/image (also known as "active").
     */
    allowed: boolean;
    /**
     * Whether there is an unescaped bracket (opening or closing) after this opening bracket in the text parsed so far.
     */
    bracketAfter: boolean;
    private constructor();
    static link(bracketNode: Text, bracketPosition: Position, contentPosition: Position, previous: Bracket, previousDelimiter: Delimiter): Bracket;
    static withMarker(markerNode: Text, markerPosition: Position, bracketNode: Text, bracketPosition: Position, contentPosition: Position, previous: Bracket, previousDelimiter: Delimiter): Bracket;
}
export default Bracket;

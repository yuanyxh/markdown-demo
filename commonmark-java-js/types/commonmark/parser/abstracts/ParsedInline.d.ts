import type { Node } from '@/node';
import type Position from '../parser_utils/Position';
/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
declare abstract class ParsedInline {
    static none(): ParsedInline | null;
    static of(node: Node, position: Position): ParsedInline;
}
export default ParsedInline;

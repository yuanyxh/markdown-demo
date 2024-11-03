


import { java } from "jree";



/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
 abstract class ParsedInline {

    staticprotected abstract  none():  ParsedInline {
        return null;
    }

    staticprotected abstract  of(node: Node| null, position: Position| null):  ParsedInline {
        java.util.Objects.requireNonNull(node, "node must not be null");
        java.util.Objects.requireNonNull(position, "position must not be null");
        return new  ParsedInlineImpl(node, position);
    }
}

import Position from "./Position";
import { ParsedInlineImpl } from "../../internal";
import { Node } from "../../node";

/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
abstract class ParsedInline {
  public static none(): ParsedInline | null {
    return null;
  }

  public static of(node: Node, position: Position): ParsedInline {
    return new ParsedInlineImpl(node, position);
  }
}

export default ParsedInline;

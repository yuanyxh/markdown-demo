import type { MarkdownNode } from "@/node";

import type Position from "../parser_utils/Position";

import { ParsedInlineImpl } from "@/internal";

/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
abstract class ParsedInline {
  public static none(): ParsedInline | null {
    return null;
  }

  public static of(node: MarkdownNode, position: Position): ParsedInline {
    return new ParsedInlineImpl(node, position);
  }
}

export default ParsedInline;

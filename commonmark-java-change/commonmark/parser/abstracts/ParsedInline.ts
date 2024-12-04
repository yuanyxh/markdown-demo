import type Position from "../parser_utils/Position";
import type { MarkdownNode } from "../../node";

import { ParsedInlineImpl } from "../../internal";

/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 *
 * 单个内联解析器的结果
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

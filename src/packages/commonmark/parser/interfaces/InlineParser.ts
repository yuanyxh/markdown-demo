import type SourceLines from "../parser_utils/SourceLines";
import type { Node } from "../../node";
import type { InlineParserFactory } from "./InlineParserFactory";

/**
 * Parser for inline content (text, links, emphasized text, etc).
 */
export interface InlineParser extends InlineParserFactory {
  /**
   * @param lines the source content to parse as inline
   * @param node the node to append resulting nodes to (as children)
   */
  parse(lines: SourceLines, node: Node): void;
}

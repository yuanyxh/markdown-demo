import type SourceLines from "../parser_utils/SourceLines";
import type { MarkdownNode } from "../../node";
import type { InlineParserFactory } from "./InlineParserFactory";

/**
 * Parser for inline content (text, links, emphasized text, etc).
 *
 * 内联内容（文本、链接、强调文本等）的解析器
 */
export interface InlineParser extends InlineParserFactory {
  /**
   * @param lines the source content to parse as inline
   * @param node the node to append resulting nodes to (as children)
   */
  parse(lines: SourceLines, node: MarkdownNode): void;
}

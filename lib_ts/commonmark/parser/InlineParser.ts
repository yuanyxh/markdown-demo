/**
 * Parser for inline content (text, links, emphasized text, etc).
 */
export interface InlineParser {
  /**
   * @param lines the source content to parse as inline
   * @param node the node to append resulting nodes to (as children)
   */
  parse(lines: SourceLines | null, node: Node | null): void;
}

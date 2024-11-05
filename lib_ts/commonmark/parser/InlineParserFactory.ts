/**
 * Factory for custom inline parser.
 */
export interface InlineParserFactory {
  /**
   * Create an {@link InlineParser} to use for parsing inlines. This is called once per parsed document.
   */
  create(inlineParserContext: InlineParserContext | null): InlineParser;
}

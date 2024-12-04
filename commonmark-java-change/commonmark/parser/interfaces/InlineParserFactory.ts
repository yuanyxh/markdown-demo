import type { InlineParser } from "./InlineParser";
import type { InlineParserContext } from "./InlineParserContext";

/**
 * Factory for custom inline parser.
 *
 * 自定义内联解析器的工厂
 */
export interface InlineParserFactory {
  /**
   * Create an {@link InlineParser} to use for parsing inlines. This is called once per parsed document.
   */
  create(inlineParserContext: InlineParserContext): InlineParser;
}

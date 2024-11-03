
import { java } from "jree";



/**
 * Factory for custom inline parser.
 */
 interface InlineParserFactory {

    /**
     * Create an {@link InlineParser} to use for parsing inlines. This is called once per parsed document.
     */
      create(inlineParserContext: InlineParserContext| null): InlineParser;
}

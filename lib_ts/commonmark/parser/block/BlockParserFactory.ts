
import { java } from "jree";



/**
 * Parser factory for a block node for determining when a block starts.
 * <p>
 * Implementations should subclass {@link AbstractBlockParserFactory} instead of implementing this directly.
 */
 interface BlockParserFactory {

      tryStart(state: ParserState| null, matchedBlockParser: MatchedBlockParser| null): BlockStart;

}

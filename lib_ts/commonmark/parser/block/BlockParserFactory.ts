import BlockStart from "./BlockStart";
import { MatchedBlockParser } from "./MatchedBlockParser";
import { ParserState } from "./ParserState";

/**
 * Parser factory for a block node for determining when a block starts.
 * <p>
 * Implementations should subclass {@link AbstractBlockParserFactory} instead of implementing this directly.
 */
export interface BlockParserFactory {
  tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null;
}

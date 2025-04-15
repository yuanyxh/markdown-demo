import type { DelimiterRun } from "./DelimiterRun";
/**
 * Custom delimiter processor for additional delimiters besides {@code _} and {@code *}.
 * <p>
 * Note that implementations of this need to be thread-safe, the same instance may be used by multiple parsers.
 *
 * @see parser.beta.InlineContentParserFactory
 */
export interface DelimiterProcessor {
    /**
     * @return the character that marks the beginning of a delimited node, must not clash with any built-in special
     * characters
     */
    getOpeningCharacter(): string;
    /**
     * @return the character that marks the the ending of a delimited node, must not clash with any built-in special
     * characters. Note that for a symmetric delimiter such as "*", this is the same as the opening.
     */
    getClosingCharacter(): string;
    /**
     * Minimum number of delimiter characters that are needed to activate this. Must be at least 1.
     */
    getMinLength(): number;
    /**
     * Process the delimiter runs.
     * <p>
     * The processor can examine the runs and the nodes and decide if it wants to process or not. If not, it should not
     * change any nodes and return 0. If yes, it should do the processing (wrapping nodes, etc) and then return how many
     * delimiters were used.
     * <p>
     * Note that removal (unlinking) of the used delimiter {@link Text} nodes is done by the caller.
     *
     * @param openingRun the opening delimiter run
     * @param closingRun the closing delimiter run
     * @return how many delimiters were used; must not be greater than length of either opener or closer
     */
    process(openingRun: DelimiterRun, closingRun: DelimiterRun): number;
}

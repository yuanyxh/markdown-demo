import type BlockStart from "../abstracts/BlockStart";
import type { MatchedBlockParser } from "./MatchedBlockParser";
import type { ParserState } from "./ParserState";

/**
 * Parser factory for a block node for determining when a block starts.
 * <p>
 * Implementations should subclass {@link AbstractBlockParserFactory} instead of implementing this directly.
 *
 * 块节点的解析器工厂, 用于确定块何时开始
 * <p>
 * 实现应该子类化 {@link AbstractBlockParserFactory} 而不是直接实现它
 */
export interface BlockParserFactory {
  tryStart(
    state: ParserState,
    matchedBlockParser: MatchedBlockParser
  ): BlockStart | null;
}

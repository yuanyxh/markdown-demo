import type SourceLines from "../parser_utils/SourceLines";
import type { BlockParser } from "./BlockParser";

/**
 * Open block parser that was last matched during the continue phase. This is different from the currently active
 * block parser, as an unmatched block is only closed when a new block is started.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 *
 * 打开在继续阶段最后匹配的块解析器; 这与当前活动的块解析器不同, 因为只有在启动新块时才会关闭不匹配的块
 *
 * *此接口不适合由客户端实现*
 */
export interface MatchedBlockParser {
  getMatchedBlockParser(): BlockParser;

  /**
   * Returns the current paragraph lines if the matched block is a paragraph.
   *
   * @return paragraph content or an empty list
   */
  getParagraphLines(): SourceLines;
}

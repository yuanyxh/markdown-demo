import type SourceLine from "../parser_utils/SourceLine";
import type { BlockParser } from "./BlockParser";

/**
 * State of the parser that is used in block parsers.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 *
 * 块解析器中使用的解析器的状态
 * <p><em>此接口不适合由客户端实现</em></p>
 */
export interface ParserState {
  /**
   * 返回当前解析的源码行
   *
   * @return the current source line being parsed (full line)
   */
  getLine(): SourceLine;

  /**
   * 返回当前所在源码行中的 offset
   *
   * @return the current index within the line (0-based)
   */
  getIndex(): number;

  /**
   * 返回当前行的下一个非空白字符的索引
   *
   * @return the index of the next non-space character starting from {@link #getIndex()} (may be the same) (0-based)
   */
  getNextNonSpaceIndex(): number;

  /**
   * The column is the position within the line after tab characters have been processed as 4-space tab stops.
   * If the line doesn't contain any tabs, it's the same as the {@link #getIndex()}. If the line starts with a tab,
   * followed by text, then the column for the first character of the text is 4 (the index is 1).
   *
   * 该列是制表符被处理为 4 个空格制表位后在行中的位置
   * 如果该行不包含任何制表符，则与 {@link #getIndex()} 相同;
   * 如果该行以制表符开头，后跟文本，则文本第一个字符的列为 4（index 为 1）
   *
   * @return the current column within the line (0-based)
   */
  getColumn(): number;

  /**
   * 列中的缩进（通过空格或制表位 4），从 {@link #getColumn()} 开始
   *
   * @return the indentation in columns (either by spaces or tab stop of 4), starting from {@link #getColumn()}
   */
  getIndent(): number;

  /**
   * 如果当前行从索引开始为空，则为 true（没有更多内容）
   *
   * @return true if the current line is blank starting from the index
   */
  isBlank(): boolean;

  /**
   * 从 document 开始向内查找, 金字塔底层最深的打开的块解析器
   *
   * @return the deepest open block parser
   */
  getActiveBlockParser(): BlockParser;
}

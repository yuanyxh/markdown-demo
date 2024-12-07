import type { DelimiterRun } from "./DelimiterRun";

/**
 * Custom delimiter processor for additional delimiters besides {@code _} and {@code *}.
 * <p>
 * Note that implementations of this need to be thread-safe, the same instance may be used by multiple parsers.
 *
 * 自定义分隔符处理器，用于除 {@code _} 和 {@code *} 之外的其他分隔符
 * <p>
 * 请注意, 同一个实例可能被多个解析器使用
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
   *
   * 激活此功能所需的最小分隔符字符数, 必须至少为 1
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
   * 处理分隔符运行
   * <p>
   * 处理器可以检查运行和节点并决定是否要处理;
   * 如果不处理, 则不应该更改任何节点并返回 0,
   * 如果处理, 则应该进行包装节点等操作，然后返回使用了多少个分隔符
   * <p>
   * 请注意，所使用的分隔符 {@link Text} 节点的删除（取消链接）是由调用者完成的
   *
   * @param openingRun the opening delimiter run
   * @param closingRun the closing delimiter run
   * @return how many delimiters were used; must not be greater than length of either opener or closer
   */
  process(openingRun: DelimiterRun, closingRun: DelimiterRun): number;
}

import type Scanner from "../parser_utils/Scanner";

export interface InlineParserState {
  /**
   * Return a scanner for the input for the current position (on the trigger character that the inline parser was added for).
   * <p>
   * Note that this always returns the same instance, if you want to backtrack you need to use
   * {@link Scanner#position()} and {@link Scanner#setPosition(Position)}.
   *
   * 返回当前位置输入的扫描仪（在添加内联解析器的触发字符上）
   * <p>
   * 请注意, 这总是返回相同的实例, 如果您想回溯, 则需要使用 {@link Scanner#position()} 和 {@link Scanner#setPosition(Position)}
   */
  getScanner(): Scanner;
}

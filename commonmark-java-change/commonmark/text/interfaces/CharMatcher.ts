/**
 * Matcher interface for {@code char} values.
 * <p>
 * Note that because this matches on {@code char} values only (as opposed to {@code int} code points),
 * this only operates on the level of code units and doesn't support supplementary characters
 * (see {@link Character#isSupplementaryCodePoint(int)}).
 *
 * {@code char} 值的匹配器接口。
 * <p>
 * 请注意，因为这仅匹配 {@code char} 值（而不是 {@code int} 代码点），
 * 这只在代码单元级别上运行，不支持增补字符
 */
export interface CharMatcher {
  /**
   * 匹配某个字符
   *
   * @param c
   */
  matches(c: string): boolean;
}

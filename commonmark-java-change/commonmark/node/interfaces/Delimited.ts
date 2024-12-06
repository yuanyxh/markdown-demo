/**
 * A node that uses delimiters in the source form (e.g. <code>*bold*</code>).
 *
 * 获取节点的分割符，如果存在(比如粗体的分割符是 *）
 */
export interface Delimited {
  /**
   * 返回开始时的分割符号
   *
   * @return the opening (beginning) delimiter, e.g. <code>*</code>
   */
  getOpeningDelimiter(): string | undefined;

  /**
   * 返回结束时的分割符号
   *
   * @return the closing (ending) delimiter, e.g. <code>*</code>
   */
  getClosingDelimiter(): string | undefined;
}

/**
 * 模拟 Java 中的 BitSet，用于位操作
 *
 * 此模块中用于记录某个 Ascii 字符是否存在（码点值作为索引）
 */
class BitSet {
  private readonly values: boolean[] = [];

  /**
   *
   * @param values 初始化值
   */
  public constructor(values?: boolean[]) {
    if (values) {
      this.values = values;
    }
  }

  /**
   * 设置指定位置的元素
   *
   * @param index
   */
  set(index: number) {
    while (index >= this.values.length) {
      this.values.push(false);
    }

    this.values[index] = true;
  }

  /**
   * 获取指定位置的元素
   *
   * @param index
   * @returns
   */
  get(index: number) {
    return this.values[index] || false;
  }

  /**
   * clone 一个新的 BitSet
   *
   * @returns
   */
  clone() {
    return new BitSet(this.values.slice(0));
  }
}

export default BitSet;

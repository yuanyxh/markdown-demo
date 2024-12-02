/**
 * 字符串拼接类
 * */
class Appendable {
  private data = "";

  /**
   *
   * @param initStr 初始化字符串
   */
  public constructor(initStr?: string) {
    if (initStr !== undefined) {
      this.data += initStr;
    }
  }

  /**
   * 追加字符
   *
   * @param str 需要追加的字符
   * @param start 追加字符从 start 开始
   * @param end 追加字符到 end 结束
   */
  public append(str: string, start = 0, end = str.length) {
    this.data += str.substring(start, end);
  }

  /**
   * 返回字符串长度
   *
   * @returns
   */
  public length() {
    return this.data.length;
  }

  /**
   * to string
   */
  public toString() {
    return this.data;
  }
}

export default Appendable;

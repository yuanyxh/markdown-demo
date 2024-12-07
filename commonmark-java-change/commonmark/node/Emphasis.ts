import type { Delimited } from "./interfaces/Delimited";
import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * 粗体
 */
class Emphasis extends MarkdownNode implements Delimited {
  private delimiter: string | undefined;

  public constructor(delimiter = "") {
    super();

    this.delimiter = delimiter;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 设置粗体的分割符
   *
   * @param delimiter
   */
  public setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  /**
   * 获取开始分割符
   *
   * @returns
   */
  public getOpeningDelimiter(): string | undefined {
    return this.delimiter;
  }

  /**
   * 获取结束分割符
   *
   * @returns
   */
  public getClosingDelimiter(): string | undefined {
    return this.delimiter;
  }
}

export default Emphasis;

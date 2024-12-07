import type { Delimited } from "./interfaces/Delimited";
import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * 粗体/斜体/粗体斜体
 */
class StrongEmphasis extends MarkdownNode implements Delimited {
  private delimiter: string;

  public constructor(delimiter: string) {
    super();

    this.delimiter = delimiter;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 设置分割符
   *
   * @param delimiter
   */
  public setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  /**
   * 返回开始的分割符
   *
   * @returns
   */
  public getOpeningDelimiter(): string {
    return this.delimiter;
  }

  /**
   * 返回结束的分割符
   *
   * @returns
   */
  public getClosingDelimiter(): string {
    return this.delimiter;
  }
}

export default StrongEmphasis;

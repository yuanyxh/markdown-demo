import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * 标题
 */
class Heading extends Block {
  private level = -1;

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取标题级别（1 - 6）
   *
   * @returns
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * 设置标题级别
   *
   * @param level
   */
  public setLevel(level: number) {
    this.level = level;
  }
}

export default Heading;

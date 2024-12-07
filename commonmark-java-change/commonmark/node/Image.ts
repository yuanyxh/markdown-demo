import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * 图像
 */
class Image extends MarkdownNode {
  private destination = "";
  private title: string | undefined;

  public constructor(destination = "", title: string | undefined) {
    super();

    this.destination = destination;
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取图像地址
   *
   * @returns
   */
  public getDestination(): string {
    return this.destination;
  }

  /**
   * 设置图像地址
   *
   * @param destination
   */
  public setDestination(destination: string) {
    this.destination = destination;
  }

  /**
   * 获取图像标题（alt 属性）
   *
   * @returns
   */
  public getTitle(): string | undefined {
    return this.title;
  }

  /**
   * 设置图像标题
   *
   * @param title
   */
  public setTitle(title: string) {
    this.title = title;
  }

  protected toStringAttributes(): string {
    return "destination=" + this.destination + ", title=" + this.title;
  }
}

export default Image;

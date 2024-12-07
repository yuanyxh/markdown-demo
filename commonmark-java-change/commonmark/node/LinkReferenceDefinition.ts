import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

/**
 * A link reference definition, e.g.:
 * <pre><code>
 * [foo]: /url "title"
 * </code></pre>
 * <p>
 * They can be referenced anywhere else in the document to produce a link using <code>[foo]</code>. The definitions
 * themselves are usually not rendered in the final output.
 *
 * 链接引用定义，例如：
 * ```md
 * [foo]: /url "title"
 * ```
 * <p>
 * 可以在文档中的任何其他位置引用它们，以使用 `[foo]` 生成链接
 * 定义本身通常不会在最终输出中呈现
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definition">Link reference definitions</a>
 */
class LinkReferenceDefinition extends Block {
  private label = "";
  private destination = "";
  private title = "";

  public constructor(label = "", destination = "", title = "") {
    super();

    this.label = label;
    this.destination = destination;
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取链接引用定义的标签（[foo] - foo）
   *
   * @returns
   */
  public getLabel(): string | null {
    return this.label;
  }

  /**
   * 设置链接引用定义的标签
   *
   * @param label
   */
  public setLabel(label: string) {
    this.label = label;
  }

  /**
   * 获取链接引用定义的地址
   *
   * @returns
   */
  public getDestination(): string {
    return this.destination;
  }

  /**
   * 设置链接引用定义的标签
   *
   * @param destination
   */
  public setDestination(destination: string) {
    this.destination = destination;
  }

  /**
   * 获取链接引用定义的标题
   *
   * @returns
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * 设置链接引用定义的标题
   *
   * @param title
   */
  public setTitle(title: string) {
    this.title = title;
  }
}

export default LinkReferenceDefinition;

import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

/**
 * A link with a destination and an optional title; the link text is in child nodes.
 * <p>
 * Example for an inline link in a CommonMark document:
 * <pre><code>
 * [link](/uri "title")
 * </code></pre>
 * <p>
 * The corresponding Link node would look like this:
 * <ul>
 * <li>{@link #getDestination()} returns {@code "/uri"}
 * <li>{@link #getTitle()} returns {@code "title"}
 * <li>A {@link Text} child node with {@link Text#getLiteral() getLiteral} that returns {@code "link"}</li>
 * </ul>
 * <p>
 * Note that the text in the link can contain inline formatting, so it could also contain an {@link Image} or
 * {@link Emphasis}, etc.
 *
 * 带有目的地和可选标题的链接；链接文本位于子节点中
 * <p>
 * CommonMark 文档中内嵌链接的示例：
 * ```md
 * [link](/uri "title")
 * ```
 * <p>
 * 相应的 Link 节点如下所示：
 *   - {@link #getDestination()} 返回 {@code "/uri"}
 *   - {@link #getTitle()} 返回 {@code "title"}
 *   - 带有 {@link Text#getLiteral() getLiteral} 的 {@link Text} 子节点，返回 {@code "link"}
 * <p>
 * 请注意，链接中的文本可以包含内联格式，因此它也可以包含 {@link Image} 或 {@link Emphasis} 等
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#links">CommonMark Spec for links</a>
 */
class Link extends MarkdownNode {
  private destination = "";
  private title: string | undefined;

  public constructor(destination = "", title?: string) {
    super();

    this.destination = destination;
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * 获取链接地址
   *
   * @returns
   */
  public getDestination(): string {
    return this.destination;
  }

  /**
   * 设置链接地址
   *
   * @param destination
   */
  public setDestination(destination: string) {
    this.destination = destination;
  }

  /**
   * 获取链接标题（title=""）
   *
   * @return the title or undefined
   */
  public getTitle(): string | undefined {
    return this.title;
  }

  /**
   * 设置链接标题
   *
   * @param title
   */
  public setTitle(title: string | undefined) {
    this.title = title;
  }

  protected toStringAttributes(): string {
    return "destination=" + this.destination + ", title=" + this.title;
  }
}

export default Link;

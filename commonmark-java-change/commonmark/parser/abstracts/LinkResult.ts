import type Position from "../parser_utils/Position";
import type { MarkdownNode } from "../../node";

import { LinkResultImpl } from "../../internal";

/**
 * What to do with a link/image processed by {@link LinkProcessor}.
 *
 * 处理由 {@link LinkProcessor} 处理的链接/图像
 */
abstract class LinkResult {
  /**
   * Link not handled by processor.
   *
   * 处理器未处理链接
   */
  public static none(): LinkResult | null {
    return null;
  }

  /**
   * Wrap the link text in a node. This is the normal behavior for links, e.g. for this:
   * <pre><code>
   * [my *text*](destination)
   * </code></pre>
   * The text is {@code my *text*}, a text node and emphasis. The text is wrapped in a
   * {@link org.commonmark.node.Link} node, which means the text is added as child nodes to it.
   *
   * 将链接文本包装在节点中, 这是链接的正常行为, 例如：
   * ```md
   * [my *text*](destination)
   * ```
   * 文本是 {@code `my *text*`}, 一个文本节点和强调,
   * 文本被包裹在 {@link org.commonmark.node.Link} 节点,
   * 表示文本作为子节点添加到其中
   *
   * @param node     the node to which the link text nodes will be added as child nodes
   * @param position the position to continue parsing from
   */
  public static wrapTextIn(node: MarkdownNode, position: Position): LinkResult {
    return new LinkResultImpl(LinkResultImpl.Type.WRAP, node, position);
  }

  /**
   * Replace the link with a node. E.g. for this:
   * <pre><code>
   * [^foo]
   * </code></pre>
   * The processor could decide to create a {@code FootnoteReference} node instead which replaces the link.
   *
   * 将链接替换为节点, 例如:
   * ```md
   * [^foo]
   * ```
   * 处理器可以决定创建一个 {@code FootnoteReference} 节点来代替链接
   *
   * @param node     the node to replace the link with
   * @param position the position to continue parsing from
   */
  public static replaceWith(
    node: MarkdownNode,
    position: Position
  ): LinkResult {
    return new LinkResultImpl(LinkResultImpl.Type.REPLACE, node, position);
  }

  /**
   * If a {@link LinkInfo#marker()} is present, include it in processing (i.e. treat it the same way as the brackets).
   *
   * 如果存在 {@link LinkInfo#marker()}, 将其包含在处理中（即以与括号相同的方式对待它）
   */
  public abstract setIncludeMarker(): LinkResult;
}

export default LinkResult;

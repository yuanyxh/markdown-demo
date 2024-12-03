import type { MarkdownNode } from "../../../node";

/**
 * Extension point for adding/changing attributes on HTML tags for a node.
 *
 * 用于在节点的 HTML 标记上添加/更改属性的扩展点
 */
export interface AttributeProvider {
  /**
   * Set the attributes for a HTML tag of the specified node by modifying the provided map.
   * <p>
   * This allows to change or even remove default attributes. With great power comes great responsibility.
   * <p>
   * The attribute key and values will be escaped (preserving character entities), so don't escape them here,
   * otherwise they will be double-escaped.
   * <p>
   * This method may be called multiple times for the same node, if the node is rendered using multiple nested
   * tags (e.g. code blocks).
   *
   * 通过修改提供的映射来设置指定节点的 HTML 标记的属性
   * <p>
   * 这允许更改甚至删除默认属性
   * <p>
   * 属性键和值将被转义（保留字符实体），所以这里不要转义它们，否则它们将被双重转义。
   * <p>
   * 如果该节点是使用多个嵌套渲染的，则该方法可能会针对同一节点多次调用标签（例如代码块）
   *
   * @param node the node to set attributes for
   * @param tagName the HTML tag name that these attributes are for (e.g. {@code h1}, {@code pre}, {@code code}).
   * @param attributes the attributes, with any default attributes already set in the map
   */
  setAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ): void;
}

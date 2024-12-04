/**
 * 源码映射设置的枚举
 */
enum IncludeSourceSpans {
  /**
   * Do not include source spans.
   *
   * 不生成源码映射
   */
  NONE = "NONE",
  /**
   * Include source spans on {@link org.commonmark.node.Block} nodes.
   *
   * 生成块节点的源码映射
   */
  BLOCKS = "BLOCKS",
  /**
   * Include source spans on block nodes and inline nodes.
   *
   * 生成块与内联节点的源码映射
   */
  BLOCKS_AND_INLINES = "BLOCKS_AND_INLINES",
}

export default IncludeSourceSpans;

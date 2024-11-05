enum IncludeSourceSpans {
  /**
   * Do not include source spans.
   */
  NONE = "NONE",
  /**
   * Include source spans on {@link org.commonmark.node.Block} nodes.
   */
  BLOCKS = "BLOCKS",
  /**
   * Include source spans on block nodes and inline nodes.
   */
  BLOCKS_AND_INLINES = "BLOCKS_AND_INLINES",
}

export default IncludeSourceSpans;

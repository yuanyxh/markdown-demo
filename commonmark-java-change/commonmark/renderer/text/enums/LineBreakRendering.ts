enum LineBreakRendering {
  /**
   * Strip all line breaks within blocks and between blocks, resulting in all the text in a single line.
   *
   * 去除块内和块之间的所有换行符，从而将所有文本放在一行中
   */
  STRIP = "STRIP",

  /**
   * Use single line breaks between blocks, not a blank line (also render all lists as tight).
   *
   * 在块之间使用单换行符，而不是空行（也会使所有列表变得紧凑）
   */
  COMPACT = "COMPACT",

  /**
   * Separate blocks by a blank line (and respect tight vs loose lists).
   *
   * 用空行分隔块（并尊重严格列表与宽松列表）
   */
  SEPARATE_BLOCKS = "SEPARATE_BLOCKS",
}

export default LineBreakRendering;

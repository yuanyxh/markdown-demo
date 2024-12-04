/**
 * Position within a {@link Scanner}. This is intentionally kept opaque so as not to expose the internal structure of
 * the Scanner.
 *
 * 在 {@link Scanner} 内的位置, 这是故意保持不透明的, 以免暴露 Scanner 内部结构
 */
class Position {
  public readonly lineIndex: number;
  public readonly index: number;

  public constructor(lineIndex: number, index: number) {
    this.lineIndex = lineIndex;
    this.index = index;
  }
}

export default Position;

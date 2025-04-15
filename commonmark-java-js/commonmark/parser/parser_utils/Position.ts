/**
 * Position within a {@link Scanner}. This is intentionally kept opaque so as not to expose the internal structure of
 * the Scanner.
 */
class Position {
  readonly lineIndex: number;
  readonly index: number;

  constructor(lineIndex: number, index: number) {
    this.lineIndex = lineIndex;
    this.index = index;
  }
}

export default Position;

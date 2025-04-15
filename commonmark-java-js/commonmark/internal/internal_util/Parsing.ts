class Parsing {
  static CODE_BLOCK_INDENT = 4;

  static columnsToNextTabStop(column: number) {
    // Tab stop is 4
    return 4 - (column % 4);
  }
}

export default Parsing;

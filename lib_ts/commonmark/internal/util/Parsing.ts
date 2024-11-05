export class Parsing extends JavaObject {
  public static CODE_BLOCK_INDENT: int = 4;

  public static columnsToNextTabStop(column: int): int {
    // Tab stop is 4
    return 4 - (column % 4);
  }
}

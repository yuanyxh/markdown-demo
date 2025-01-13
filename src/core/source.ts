const LINE_BREAK_REGEXP = /\r\n|\n|\r/g;

/** document source code */
class Source extends String {
  private lines: string[] = [];

  private innerSource: string | null = null;

  public constructor(source: string = '') {
    super(source);

    this.set(source);
  }

  /**
   * TODO: This will never run. It is placed here to emphasize this problem.
   */
  public get length(): number {
    return 0;
  }

  /**
   * Obtain the line where the offset is located.
   *
   * @param position Offset in the source code.
   * @returns {string} source line
   */
  public lineAt(position: number): string {
    let lineSource: string;
    let lineStart: number = 0;
    let lineEnd: number = 0;

    for (let i = 0; i < this.lines.length; i++) {
      lineSource = this.lines[i];

      if (i === this.lines.length - 1 && lineSource === '') {
        break;
      }

      lineEnd = lineStart + lineSource.length + 1;

      if (position >= lineStart && position <= lineEnd) {
        return lineSource;
      }

      lineStart = lineEnd;
    }

    return '';
  }

  /**
   * Set the document source code.
   *
   * @param source Source code.
   */
  public set(source: string): void {
    LINE_BREAK_REGEXP.lastIndex = 0;

    this.lines = source.split(LINE_BREAK_REGEXP);

    this.innerSource = null;
  }

  /**
   * Update the document source code.
   *
   * @param from Starting offset
   * @param to Ending offset
   * @param text Plain text
   */
  public update(from = 0, to = this.toString().length, text = ''): void {
    this.set(this.slice(0, from) + text + this.slice(to));
  }

  /**
   * Compare whether the documents are equal.
   *
   * @param text
   * @returns {boolean} If they are different, return false.
   */
  public compare(text: string): boolean {
    return this.toString() === text;
  }

  public override toString(): string {
    if (this.innerSource === null) {
      this.innerSource = this.lines.reduce((source, curr) => source + curr + '\n', '');

      if (this.lines[this.lines.length - 1] === '') {
        this.innerSource = this.innerSource.slice(0, this.innerSource.length - 1);
      }
    }

    return this.innerSource;
  }

  public override valueOf(): string {
    return this.toString();
  }
}

export default Source;

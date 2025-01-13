const LINE_BREAK_REGEXP = /[\r|\n|\r\n]/g;

/** document source code */
class Source extends String {
  private lines: string[] = [];

  private innerLength = -1;
  private innerSource: string | null = null;

  public constructor(source: string = '') {
    super(source);

    this.set(source);
  }

  /**
   * @returns {number} Return the length of the document source code.
   */
  public override get length(): number {
    if (this.innerLength === -1) {
      this.innerLength = this.lines.reduce((total, curr) => total + curr.length + 1, 0);

      if (this.lines[this.lines.length - 1] === '') {
        this.innerLength -= 1;
      }
    }

    return this.innerLength;
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
    this.lines = source.split(LINE_BREAK_REGEXP);

    this.innerLength = -1;
    this.innerSource = null;
  }

  /**
   * Update the document source code.
   *
   * @param from Starting offset
   * @param to Ending offset
   * @param text Plain text
   */
  public update(from = 0, to = this.length, text = ''): void {
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

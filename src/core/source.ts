const LINE_BREAK_REGEXP = /[\r|\n|\r\n]/g;

class Source extends String {
  private lines: string[] = [];

  private innerLength = -1;
  private innerSource: string | null = null;

  public constructor(source: string = '') {
    super(source);

    this.set(source);
  }

  public get length() {
    if (this.innerLength === -1) {
      this.innerLength = this.lines.reduce((total, curr) => total + curr.length + 1, 0);

      if (this.lines[this.lines.length - 1] === '') {
        this.innerLength -= 1;
      }
    }

    return this.innerLength;
  }

  public lineAt(position: number) {
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

  public set(source: string) {
    this.lines = source.split(LINE_BREAK_REGEXP);

    this.innerLength = -1;
    this.innerSource = null;
  }

  public update(from = 0, to = this.length, text = '') {
    this.set(this.slice(0, from) + text + this.slice(to));
  }

  public compare(text: string) {
    return this.toString() === text;
  }

  public toString(): string {
    if (this.innerSource === null) {
      this.innerSource = this.lines.reduce((source, curr) => source + curr + '\n', '');

      if (this.lines[this.lines.length - 1] === '') {
        this.innerSource = this.innerSource.slice(0, this.innerSource.length - 1);
      }
    }

    return this.innerSource;
  }

  public valueOf(): string {
    return this.toString();
  }
}

export default Source;

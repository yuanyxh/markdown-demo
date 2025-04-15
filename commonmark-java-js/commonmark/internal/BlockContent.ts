import { Appendable } from '@helpers/index';

class BlockContent {
  private readonly sb: Appendable;

  private lineCount = 0;

  constructor(content: string = '') {
    this.sb = new Appendable(content);
  }

  add(line: string) {
    if (this.lineCount !== 0) {
      this.sb.append('\n');
    }

    this.sb.append(line);
    this.lineCount++;
  }

  getString(): string {
    return this.sb.toString();
  }
}

export default BlockContent;

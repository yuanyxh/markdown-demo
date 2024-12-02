import { Appendable } from "../../helpers";

class BlockContent {
  private readonly sb: Appendable;

  private lineCount = 0;

  public constructor(content: string = "") {
    this.sb = new Appendable(content);
  }

  public add(line: string) {
    if (this.lineCount !== 0) {
      this.sb.append("\n");
    }

    this.sb.append(line);
    this.lineCount++;
  }

  public getString(): string {
    return this.sb.toString();
  }
}

export default BlockContent;

import type { Delimited } from "./interfaces/Delimited";
import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class StrongEmphasis extends MarkdownNode implements Delimited {
  private delimiter: string;

  public constructor(delimiter: string) {
    super("strong-emphasis");

    this.delimiter = delimiter;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  public getOpeningDelimiter(): string {
    return this.delimiter;
  }

  public getClosingDelimiter(): string {
    return this.delimiter;
  }
}

export default StrongEmphasis;

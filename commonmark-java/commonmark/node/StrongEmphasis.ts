import type { Delimited } from "./interfaces/Delimited";
import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class StrongEmphasis extends MarkdownNode implements Delimited {
  private delimiter: string;

  public constructor(delimiter: string) {
    super();
    this.delimiter = delimiter;
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

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default StrongEmphasis;

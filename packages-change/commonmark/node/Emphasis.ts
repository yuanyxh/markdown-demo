import type { Delimited } from "./interfaces/Delimited";
import type { Visitor } from "./interfaces/Visitor";

import MarkdownNode from "./abstracts/MarkdownNode";

class Emphasis extends MarkdownNode implements Delimited {
  private delimiter: string | undefined;

  public constructor(delimiter = "") {
    super();

    this.delimiter = delimiter;
  }

  public setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  public getOpeningDelimiter(): string | undefined {
    return this.delimiter;
  }

  public getClosingDelimiter(): string | undefined {
    return this.delimiter;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Emphasis;

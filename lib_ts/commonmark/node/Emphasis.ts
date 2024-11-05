import { Delimited } from "./Delimited";
import Node from "./Node";
import { Visitor } from "./Visitor";

class Emphasis extends Node implements Delimited {
  private delimiter: string;

  public constructor(delimiter = "") {
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

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default Emphasis;

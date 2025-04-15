import type { Delimited } from './interfaces/Delimited';
import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Emphasis extends Node implements Delimited {
  private delimiter: string | undefined;

  public constructor(delimiter = '') {
    super('emphasis');

    this.delimiter = delimiter;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
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
}

export default Emphasis;

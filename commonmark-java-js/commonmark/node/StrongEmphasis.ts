import type { Delimited } from './interfaces/Delimited';
import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class StrongEmphasis extends Node implements Delimited {
  private delimiter: string;

  constructor(delimiter: string) {
    super('strong-emphasis');

    this.delimiter = delimiter;
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  getOpeningDelimiter(): string {
    return this.delimiter;
  }

  getClosingDelimiter(): string {
    return this.delimiter;
  }
}

export default StrongEmphasis;

import type { Delimited } from './interfaces/Delimited';
import type { Visitor } from './interfaces/Visitor';

import Node from './abstracts/Node';

class Emphasis extends Node implements Delimited {
  private delimiter: string | undefined;

  constructor(delimiter = '') {
    super('emphasis');

    this.delimiter = delimiter;
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  setDelimiter(delimiter: string) {
    this.delimiter = delimiter;
  }

  getOpeningDelimiter(): string | undefined {
    return this.delimiter;
  }

  getClosingDelimiter(): string | undefined {
    return this.delimiter;
  }
}

export default Emphasis;

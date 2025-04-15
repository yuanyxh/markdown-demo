import type { Visitor } from './interfaces/Visitor';

import Block from './abstracts/Block';

class Heading extends Block {
  private level = -1;

  constructor() {
    super('heading');
  }

  override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  getLevel(): number {
    return this.level;
  }

  setLevel(level: number) {
    this.level = level;
  }
}

export default Heading;

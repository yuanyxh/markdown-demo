import type { Visitor } from '../interfaces/Visitor';

import Node from './Node';

abstract class CustomNode extends Node {
  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default CustomNode;

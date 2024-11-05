import Node from "./Node";

class NodeIterable implements Iterable<Node> {
  private readonly first: Node;
  private readonly end: Node;

  public constructor(first: Node, end: Node) {
    this.first = first;
    this.end = end;
  }

  [Symbol.iterator](): Iterator<Node, any, any> {
    return this.iterator();
  }

  public iterator(): Iterator<Node> {
    return new NodeIterator(this.first, this.end);
  }
}

class NodeIterator implements Iterator<Node> {
  private node: Node | null;
  private readonly end: Node;

  public constructor(first: Node, end: Node) {
    this.node = first;
    this.end = end;
  }

  public hasNext(): boolean {
    return this.node !== null && this.node !== this.end;
  }

  public next(): IteratorResult<Node> {
    const result = this.node;
    this.node = this.node ? this.node.getNext() : null;

    if (result === null || result === this.end) {
      return { done: true, value: result };
    }

    return { done: false, value: result };
  }

  public remove(): void {
    throw new Error("remove");
  }
}

/**
 * Utility class for working with multiple {@link Node}s.
 *
 * @since 0.16.0
 */
class Nodes {
  /**
   * The nodes between (not including) start and end.
   */
  public static between(start: Node, end: Node): NodeIterable {
    const first = start.getNext();
    if (first !== null) {
      return new NodeIterable(first, end);
    }

    throw Error("Null first node.");
  }

  public static NodeIterable = NodeIterable;

  public static NodeIterator = NodeIterator;
}

export default Nodes;

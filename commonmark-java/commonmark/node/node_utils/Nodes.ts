import type MarkdownNode from "../abstracts/MarkdownNode";

class MarkdownNodeIterable implements Iterable<MarkdownNode> {
  private readonly first: MarkdownNode;
  private readonly end: MarkdownNode;

  public constructor(first: MarkdownNode, end: MarkdownNode) {
    this.first = first;
    this.end = end;
  }

  [Symbol.iterator](): Iterator<MarkdownNode, any, any> {
    return this.iterator();
  }

  public iterator(): Iterator<MarkdownNode> {
    return new MarkdownNodeIterator(this.first, this.end);
  }
}

class MarkdownNodeIterator implements Iterator<MarkdownNode> {
  private node: MarkdownNode | null;
  private readonly end: MarkdownNode;

  public constructor(first: MarkdownNode, end: MarkdownNode) {
    this.node = first;
    this.end = end;
  }

  // public hasNext(): boolean {
  //   return this.node !== null && this.node !== this.end;
  // }

  public next(): IteratorResult<MarkdownNode> {
    const result = this.node;
    this.node = this.node ? this.node.getNext() : null;

    if (result === null || result === this.end) {
      return { done: true, value: result };
    }

    return { done: false, value: result };
  }
}

/**
 * Utility class for working with multiple {@link MarkdownNode}s.
 *
 * @since 0.16.0
 */
class Nodes {
  /**
   * The nodes between (not including) start and end.
   */
  public static between(
    start: MarkdownNode,
    end: MarkdownNode
  ): MarkdownNodeIterable {
    const first = start.getNext();

    if (first !== null) {
      return new MarkdownNodeIterable(first, end);
    }

    throw Error("Null first node.");
  }

  public static MarkdownNodeIterable = MarkdownNodeIterable;

  public static MarkdownNodeIterator = MarkdownNodeIterator;
}

export default Nodes;

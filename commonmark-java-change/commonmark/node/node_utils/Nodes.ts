import type MarkdownNode from "../abstracts/MarkdownNode";

/**
 * 迭代节点的迭代者
 */
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

  /**
   * 获取迭代器
   *
   * @returns
   */
  public iterator(): Iterator<MarkdownNode> {
    return new MarkdownNodeIterator(this.first, this.end);
  }
}

/**
 * 迭代节点的迭代器
 */
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
 * 用于处理多个 {@link MarkdownNode} 的实用程序类
 *
 * @since 0.16.0
 */
class Nodes {
  /**
   * The nodes between (not including) start and end.
   *
   * 从开始节点迭代至结束节点
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

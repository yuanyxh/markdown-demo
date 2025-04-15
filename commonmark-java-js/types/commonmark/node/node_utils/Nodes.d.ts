import type Node from '../abstracts/Node';
declare class MarkdownNodeIterable implements Iterable<Node> {
    private readonly first;
    private readonly end;
    constructor(first: Node, end: Node);
    [Symbol.iterator](): Iterator<Node, any, any>;
    iterator(): Iterator<Node>;
}
declare class MarkdownNodeIterator implements Iterator<Node> {
    private node;
    private readonly end;
    constructor(first: Node, end: Node);
    next(): IteratorResult<Node>;
}
/**
 * Utility class for working with multiple {@link Node}s.
 *
 * @since 0.16.0
 */
declare class Nodes {
    /**
     * The nodes between (not including) start and end.
     */
    static between(start: Node, end: Node): MarkdownNodeIterable;
    static MarkdownNodeIterable: typeof MarkdownNodeIterable;
    static MarkdownNodeIterator: typeof MarkdownNodeIterator;
}
export default Nodes;

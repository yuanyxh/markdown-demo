import type SourceSpan from '../node_utils/SourceSpan';
import type { Visitor } from '../interfaces/Visitor';
/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 */
declare abstract class Node {
    private innerType;
    private innerMeta;
    private innerChildren;
    private innerInputIndex;
    private innerInputEndInput;
    private parent;
    private firstChild;
    private lastChild;
    private prev;
    private next;
    private sourceSpans;
    constructor(type: string);
    /**
     * @returns {string} This property reflects the type of the node.
     */
    get type(): string;
    /**
     * @returns {Record<string, any>} This property allows external data to be attached.
     */
    get meta(): Record<string, any>;
    set meta(meta: Record<string, any>);
    /**
     * @returns {number} This property returns the position of the start of the node in the source code.
     */
    get inputIndex(): number;
    /**
     * @returns {number} This property returns the position of the end of the node in the source code.
     */
    get inputEndIndex(): number;
    /**
     * @returns {Node[]} This property returns the list of child nodes to which the node belongs.
     */
    get children(): Node[];
    abstract accept(visitor: Visitor): void;
    /**
     *
     * @returns {boolean} Is's a block node.
     */
    isBlock(): boolean;
    /**
     *
     * @returns {Node | null} Return the next node.
     */
    getNext(): Node | null;
    /**
     *
     * @returns {Node | null} Return the prev node.
     */
    getPrevious(): Node | null;
    /**
     *
     * @returns {Node | null} Return the first child.
     */
    getFirstChild(): Node | null;
    /**
     *
     * @returns {Node | null} Return the last child.
     */
    getLastChild(): Node | null;
    /**
     *
     * @returns {Node | null} Return the parent node.
     */
    getParent(): Node | null;
    /**
     * Set the parent node.
     */
    setParent(parent: Node): void;
    /**
     * Append a child node.
     *
     * @param child
     */
    appendChild(child: Node): void;
    /**
     * Prepend a child node.
     *
     * @param child
     */
    prependChild(child: Node): void;
    /**
     * Remove all links.
     */
    unlink(): void;
    /**
     * Inserts the {@code sibling} node after {@code this} node.
     */
    insertAfter(sibling: Node): void;
    /**
     * Inserts the {@code sibling} node before {@code this} node.
     */
    insertBefore(sibling: Node): void;
    /**
     * @return the source spans of this node if included by the parser, an empty list otherwise
     * @since 0.16.0
     */
    getSourceSpans(): SourceSpan[];
    /**
     * Replace the current source spans with the provided list.
     *
     * @param sourceSpans the new source spans to set
     * @since 0.16.0
     */
    setSourceSpans(sourceSpans: SourceSpan[]): void;
    /**
     * Add a source span to the end of the list.
     *
     * @param sourceSpan the source span to add
     * @since 0.16.0
     */
    addSourceSpan(sourceSpan: SourceSpan): void;
}
export default Node;

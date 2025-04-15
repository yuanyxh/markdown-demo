import type SourceSpan from '../node_utils/SourceSpan';
import type { Visitor } from '../interfaces/Visitor';

/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 */
abstract class Node {
  private innerType: string;
  private innerMeta: Record<string, any> = {};
  private innerChildren: Node[] = [];
  private innerInputIndex: number = -1;
  private innerInputEndInput: number = -1;

  private parent: Node | null = null;
  private firstChild: Node | null = null;
  private lastChild: Node | null = null;
  private prev: Node | null = null;
  private next: Node | null = null;
  private sourceSpans: SourceSpan[] | null = null;

  public constructor(type: string) {
    this.innerType = type;
  }

  /**
   * @returns {string} This property reflects the type of the node.
   */
  public get type(): string {
    return this.innerType;
  }

  /**
   * @returns {Record<string, any>} This property allows external data to be attached.
   */
  public get meta(): Record<string, any> {
    return this.innerMeta;
  }

  public set meta(meta: Record<string, any>) {
    this.innerMeta = meta;
  }

  /**
   * @returns {number} This property returns the position of the start of the node in the source code.
   */
  public get inputIndex(): number {
    if (this.innerInputIndex === -1) {
      this.innerInputIndex = this.getSourceSpans()[0]?.getInputIndex() || 0;
    }

    return this.innerInputIndex;
  }

  /**
   * @returns {number} This property returns the position of the end of the node in the source code.
   */
  public get inputEndIndex(): number {
    if (this.innerInputEndInput === -1) {
      const spans = this.getSourceSpans();
      const lastSpan = spans[spans.length - 1];

      if (!lastSpan) {
        this.innerInputEndInput = 0;
      } else {
        this.innerInputEndInput = lastSpan.getInputIndex() + lastSpan.getLength();
      }
    }

    return this.innerInputEndInput;
  }

  /**
   * @returns {Node[]} This property returns the list of child nodes to which the node belongs.
   */
  public get children(): Node[] {
    if (this.innerChildren.length) {
      return this.innerChildren;
    }

    let curr = this.getFirstChild();

    const children: Node[] = [];

    if (!curr) {
      return children;
    }

    children.push(curr);

    while ((curr = curr.getNext())) {
      children.push(curr);
    }

    return children;
  }

  public abstract accept(visitor: Visitor): void;

  /**
   *
   * @returns {boolean} Is's a block node.
   */
  public isBlock(): boolean {
    return false;
  }

  /**
   *
   * @returns {Node | null} Return the next node.
   */
  public getNext(): Node | null {
    return this.next;
  }

  /**
   *
   * @returns {Node | null} Return the prev node.
   */
  public getPrevious(): Node | null {
    return this.prev;
  }

  /**
   *
   * @returns {Node | null} Return the first child.
   */
  public getFirstChild(): Node | null {
    return this.firstChild;
  }

  /**
   *
   * @returns {Node | null} Return the last child.
   */
  public getLastChild(): Node | null {
    return this.lastChild;
  }

  /**
   *
   * @returns {Node | null} Return the parent node.
   */
  public getParent(): Node | null {
    return this.parent;
  }

  /**
   * Set the parent node.
   */
  public setParent(parent: Node): void {
    this.parent = parent;
  }

  /**
   * Append a child node.
   *
   * @param child
   */
  public appendChild(child: Node): void {
    child.unlink();
    child.setParent(this);

    if (this.lastChild !== null) {
      this.lastChild.next = child;
      child.prev = this.lastChild;
      this.lastChild = child;
    } else {
      this.firstChild = child;
      this.lastChild = child;
    }
  }

  /**
   * Prepend a child node.
   *
   * @param child
   */
  public prependChild(child: Node): void {
    child.unlink();
    child.setParent(this);

    if (this.firstChild !== null) {
      this.firstChild.prev = child;
      child.next = this.firstChild;
      this.firstChild = child;
    } else {
      this.firstChild = child;
      this.lastChild = child;
    }
  }

  /**
   * Remove all links.
   */
  public unlink(): void {
    this.innerChildren.length = 0;

    if (this.prev !== null) {
      this.prev.next = this.next;
    } else if (this.parent !== null) {
      this.parent.firstChild = this.next;
    }

    if (this.next !== null) {
      this.next.prev = this.prev;
    } else if (this.parent !== null) {
      this.parent.lastChild = this.prev;
    }

    this.parent = null;
    this.next = null;
    this.prev = null;
  }

  /**
   * Inserts the {@code sibling} node after {@code this} node.
   */
  public insertAfter(sibling: Node): void {
    sibling.unlink();

    sibling.next = this.next;
    if (sibling.next !== null) {
      sibling.next.prev = sibling;
    }

    sibling.prev = this;
    this.next = sibling;

    sibling.parent = this.parent;
    if (sibling.parent && sibling.next === null) {
      sibling.parent.lastChild = sibling;
    }
  }

  /**
   * Inserts the {@code sibling} node before {@code this} node.
   */
  public insertBefore(sibling: Node): void {
    sibling.unlink();

    sibling.prev = this.prev;
    if (sibling.prev !== null) {
      sibling.prev.next = sibling;
    }

    sibling.next = this;
    this.prev = sibling;

    sibling.parent = this.parent;
    if (sibling.parent && sibling.prev === null) {
      sibling.parent.firstChild = sibling;
    }
  }

  /**
   * @return the source spans of this node if included by the parser, an empty list otherwise
   * @since 0.16.0
   */
  public getSourceSpans(): SourceSpan[] {
    return this.sourceSpans !== null ? this.sourceSpans.slice(0) : [];
  }

  /**
   * Replace the current source spans with the provided list.
   *
   * @param sourceSpans the new source spans to set
   * @since 0.16.0
   */
  public setSourceSpans(sourceSpans: SourceSpan[]) {
    if (sourceSpans.length === 0) {
      this.sourceSpans = null;
    } else {
      this.sourceSpans = sourceSpans.slice(0);
    }
  }

  /**
   * Add a source span to the end of the list.
   *
   * @param sourceSpan the source span to add
   * @since 0.16.0
   */
  public addSourceSpan(sourceSpan: SourceSpan) {
    if (this.sourceSpans === null) {
      this.sourceSpans = [];
    }

    this.sourceSpans.push(sourceSpan);
  }
}

export default Node;

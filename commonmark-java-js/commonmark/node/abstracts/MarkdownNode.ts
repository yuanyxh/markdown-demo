import type SourceSpan from '../node_utils/SourceSpan';
import type { Visitor } from '../interfaces/Visitor';

/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 */
abstract class MarkdownNode {
  private innerType: string;
  private innerMeta: Record<string, any> = {};
  private innerChildren: MarkdownNode[] = [];
  private innerInputIndex: number = -1;
  private innerInputEndInput: number = -1;

  private parent: MarkdownNode | null = null;
  private firstChild: MarkdownNode | null = null;
  private lastChild: MarkdownNode | null = null;
  private prev: MarkdownNode | null = null;
  private next: MarkdownNode | null = null;
  private sourceSpans: SourceSpan[] | null = null;

  public constructor(type: string) {
    this.innerType = type;
  }

  public get meta() {
    return this.innerMeta;
  }

  public set meta(meta: Record<string, any>) {
    this.innerMeta = meta;
  }

  public get type() {
    return this.innerType;
  }

  public get inputIndex() {
    if (this.innerInputIndex === -1) {
      this.innerInputIndex = this.getSourceSpans()[0]?.getInputIndex() || 0;
    }

    return this.innerInputIndex;
  }

  public get inputEndIndex() {
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

  public get children() {
    if (this.innerChildren.length) {
      return this.innerChildren;
    }

    let curr = this.getFirstChild();

    const children: MarkdownNode[] = [];

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

  public isBlock() {
    return false;
  }

  public getNext(): MarkdownNode | null {
    return this.next;
  }

  public getPrevious(): MarkdownNode | null {
    return this.prev;
  }

  public getFirstChild(): MarkdownNode | null {
    return this.firstChild;
  }

  public getLastChild(): MarkdownNode | null {
    return this.lastChild;
  }

  public getParent(): MarkdownNode | null {
    return this.parent;
  }
  public setParent(parent: MarkdownNode) {
    this.parent = parent;
  }

  public appendChild(child: MarkdownNode) {
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

  public prependChild(child: MarkdownNode) {
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

  public unlink() {
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
  public insertAfter(sibling: MarkdownNode): void {
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
  public insertBefore(sibling: MarkdownNode): void {
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

export default MarkdownNode;

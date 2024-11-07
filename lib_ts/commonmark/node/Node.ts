import SourceSpan from "./SourceSpan";
import { Visitor } from "./Visitor";

/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 */
abstract class Node {
  private parent: Node | null = null;
  private firstChild: Node | null = null;
  private lastChild: Node | null = null;
  private prev: Node | null = null;
  private next: Node | null = null;
  private sourceSpans: SourceSpan[] | null = null;

  public abstract accept(visitor: Visitor): void;

  public getNext(): Node | null {
    return this.next;
  }

  public getPrevious(): Node | null {
    return this.prev;
  }

  public getFirstChild(): Node | null {
    return this.firstChild;
  }

  public getLastChild(): Node | null {
    return this.lastChild;
  }

  public getParent(): Node | null {
    return this.parent;
  }

  protected setParent(parent: Node) {
    this.parent = parent;
  }

  public appendChild(child: Node) {
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

  public prependChild(child: Node) {
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
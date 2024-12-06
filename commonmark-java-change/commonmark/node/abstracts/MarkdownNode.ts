import type SourceSpan from "../node_utils/SourceSpan";
import type { Visitor } from "../interfaces/Visitor";

/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 *
 * 所有 CommonMark AST 节点（{@link Block} 和内联节点）的基类
 * <p>
 * 一个节点可以有多个子节点和一个父节点（根节点除外）
 */
abstract class MarkdownNode {
  private parent: MarkdownNode | null = null;
  private firstChild: MarkdownNode | null = null;
  private lastChild: MarkdownNode | null = null;
  private prev: MarkdownNode | null = null;
  private next: MarkdownNode | null = null;
  private sourceSpans: SourceSpan[] | null = null;

  /**
   * 通过访问器访问当前节点的方法
   *
   * @param visitor
   */
  public abstract accept(visitor: Visitor): void;

  /**
   * 获取当前节点的下一个兄弟节点
   *
   * @returns
   */
  public getNext(): MarkdownNode | null {
    return this.next;
  }

  /**
   * 获取当前节点的上一个兄弟节点
   *
   * @returns
   */
  public getPrevious(): MarkdownNode | null {
    return this.prev;
  }

  /**
   * 获取当前节点的第一个子节点
   *
   * @returns
   */
  public getFirstChild(): MarkdownNode | null {
    return this.firstChild;
  }

  /**
   * 获取当前节点的最后一个子节点
   *
   * @returns
   */
  public getLastChild(): MarkdownNode | null {
    return this.lastChild;
  }

  /**
   * 获取当前节点的父级节点
   *
   * @returns
   */
  public getParent(): MarkdownNode | null {
    return this.parent;
  }

  /**
   * 获取当前节点的所有子节点
   *
   * @returns
   */
  public getChildren(): MarkdownNode[] {
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

  /**
   * 设置当前节点的父级节点
   *
   * @param parent
   */
  public setParent(parent: MarkdownNode) {
    this.parent = parent;
  }

  /**
   * 将指定节点设置为当前节点的最后一个子节点（进行必要的清理动作）
   *
   * @param child
   */
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

  /**
   * 将指定节点作为当前节点的第一个子节点（进行必要的清理动作）
   *
   * @param child
   */
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

  /**
   * 清理所有关联的节点
   */
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
   *
   * 在当前节点后面插入兄弟节点
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
   *
   * 在当前节点前面插入兄弟节点
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
   * 返回此节点的源码索引列表
   *
   * @return the source spans of this node if included by the parser, an empty list otherwise
   * @since 0.16.0
   */
  public getSourceSpans(): SourceSpan[] {
    return this.sourceSpans !== null ? this.sourceSpans.slice(0) : [];
  }

  /**
   * Replace the current source spans with the provided list.
   *
   * 设置此节点的源码索引列表
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
   * 将源码索引范围添加到列表末尾
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

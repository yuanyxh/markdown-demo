import type { Node as MarkdownNode } from 'commonmark-java-js';
import type EditorContext from '../../EditorContext';

import { TypeUtils, MarkdownNodeUtils } from '../../utils';

abstract class ContentView {
  abstract children: ContentView[];
  node: MarkdownNode;

  protected parent: ContentView | null = null;
  protected context: EditorContext;

  private _dom: HTMLElement;

  constructor(node: MarkdownNode, context: EditorContext) {
    this.node = node;
    this.context = context;

    this._dom = this.createElement(node);
    this._dom.$view = this;
  }

  get dom(): HTMLElement {
    return this._dom;
  }

  set dom(dom: HTMLElement) {
    if (this._dom) {
      delete this._dom.$view;
    }

    this._dom = dom;
    this._dom.$view = this;
  }

  eq(node: MarkdownNode): boolean {
    return node.type === this.node.type;
  }

  setNode(node: MarkdownNode): void {
    this.applyNode(node);
    this.node = node;
  }

  setParent(parent: ContentView): void {
    if (this.parent != parent) {
      this.parent?.removeChild(this, false);

      this.parent = parent;
    }
  }

  appendChild(view: ContentView): void {
    this.children.push(view);

    view.setParent(this);
    this.dom.appendChild(view.dom);
  }

  insertBefore(view: ContentView, reference: ContentView): void {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === reference) {
        this.children.splice(i, 0, view);

        view.setParent(this);
        this.dom.insertBefore(view.dom, reference.dom);

        break;
      }
    }
  }

  removeChild(view: ContentView, shouldDestroy = true): ContentView {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === view) {
        shouldDestroy && this.children[i].destroy();

        break;
      }
    }

    return view;
  }

  locateSrcPos(node: Node, offset: number): number {
    if (TypeUtils.isText(node) && node.parentElement) {
      const textNode = node.parentElement.$view.node;

      if (!textNode) {
        return -1;
      }

      return textNode.inputIndex + offset;
    }

    const element = node as HTMLElement;

    const block = element.$view.node;

    if (offset === 0) {
      return MarkdownNodeUtils.getContentIndex(block);
    }

    let isSoftLineBreak = false;
    let childMarkdownNode: MarkdownNode | null = block.children[offset - 1];

    if (childMarkdownNode?.isBlock() && childMarkdownNode.getNext()) {
      childMarkdownNode = childMarkdownNode.getNext();
    }

    if (childMarkdownNode && TypeUtils.isSoftLineBreak(childMarkdownNode)) {
      childMarkdownNode = childMarkdownNode.getPrevious();

      isSoftLineBreak = true;
    }

    if (!childMarkdownNode) {
      return -1;
    }

    if (isSoftLineBreak) {
      const continuousLine = childMarkdownNode.getNext()!.getNext();

      if (!continuousLine) {
        return childMarkdownNode.inputEndIndex + 1;
      }

      return continuousLine.inputIndex;
    }

    return childMarkdownNode.inputEndIndex;
  }

  locatePointFromSrcPos(pos: number): {
    node: Node;
    offset: number;
  } | null {
    return null;
  }

  isOpend(): boolean {
    return true;
  }

  destroy(): void {
    if (this.dom.isConnected) {
      this.dom.remove();
      this.node.unlink();
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].destroy();
    }

    this.parent = null;
  }

  protected applyNode(node: MarkdownNode): this {
    const nodeChildren = node.children;
    const children = this.children.slice(0);

    const finalSubList: (ContentView | MarkdownNode)[] = [];

    let index = 0;
    let oldIndex = -1;
    let nodeChild: MarkdownNode;

    for (; index < nodeChildren.length; index++) {
      nodeChild = nodeChildren[index];

      oldIndex = children.findIndex((child) => child.eq(nodeChild));

      if (oldIndex >= 0) {
        children[oldIndex].setNode(nodeChild);

        finalSubList[index] = children[oldIndex];
      } else {
        finalSubList[index] = nodeChild;
      }

      oldIndex = -1;
    }

    // These operations will change the children
    for (const child of children) {
      if (!finalSubList.includes(child)) {
        this.removeChild(child);
      }
    }

    const newChildren: ContentView[] = [];
    let newChild: ContentView | MarkdownNode;
    let view: ContentView | null;
    for (let i = 0; i < finalSubList.length; i++) {
      newChild = finalSubList[i];

      if (newChild instanceof ContentView) {
        if (i < this.children.indexOf(newChild)) {
          this.children[i + 1]
            ? this.insertBefore(newChild, this.children[i + 1])
            : this.appendChild(newChild);
        }

        newChildren.push(newChild);

        continue;
      }

      view = this.createViewByNodeType(this.context.getNodeViewConstructor(newChild), newChild);

      if (view) {
        this.children[i + 1]
          ? this.insertBefore(view, this.children[i + 1])
          : this.appendChild(view);

        newChildren.push(view);

        if (view.isOpend()) {
          view.setNode(newChild);
        }
      }
    }

    this.children = newChildren;

    return this;
  }

  private createViewByNodeType(
    Constructor: typeof ContentView | null,
    node: MarkdownNode
  ): ContentView | null {
    if (Constructor) {
      return new (Constructor as new (node: MarkdownNode, context: EditorContext) => ContentView)(
        node,
        this.context
      );
    }

    return null;
  }

  protected abstract createElement(node: MarkdownNode): HTMLElement;
}

export default ContentView;

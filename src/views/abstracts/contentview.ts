import type { Node as MarkdownNode } from 'commonmark-java-js';
import type EditorContext from '../../EditorContext';

abstract class ContentView {
  abstract children: ContentView[];

  protected parent: ContentView | null = null;
  protected node: MarkdownNode;
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

  applyNode(node: MarkdownNode): this {
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
        if (children[oldIndex].isOpend()) {
          children[oldIndex].applyNode(nodeChild);
        }

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

      view = this.context?.createViewByNodeType(newChild);

      if (view) {
        this.children[i + 1]
          ? this.insertBefore(view, this.children[i + 1])
          : this.appendChild(view);

        newChildren.push(view);

        if (view.isOpend()) {
          view.applyNode(newChild);
        }
      }
    }

    // Always replace the old markdown nodes.
    this.setNode(node);

    this.children = newChildren;

    return this;
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

  protected abstract createElement(node: MarkdownNode): HTMLElement;

  static get(node: Node): ContentView | null {
    return node.$view || null;
  }

  static craete(node: MarkdownNode, context: EditorContext): ContentView {
    throw Error(
      'This static method cannot be called directly. It must be overridden by a subclass.'
    );
  }
}

export default ContentView;

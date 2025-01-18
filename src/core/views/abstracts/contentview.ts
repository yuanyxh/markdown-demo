import type { MarkdownNode } from 'commonmark-java-js';

abstract class ContentView {
  public abstract children: ContentView[];

  protected parent: ContentView | null = null;
  protected node: MarkdownNode;

  private _dom: HTMLElement;

  protected static nodeRelationMap = new Map<typeof MarkdownNode, typeof ContentView>();

  public constructor(node: MarkdownNode) {
    this.node = node;
    this._dom = this.createElement(node);
    (this._dom as any).$view = this;
  }

  public get dom(): HTMLElement {
    return this._dom;
  }

  public set dom(dom: HTMLElement) {
    if (this._dom) {
      delete (this._dom as any).$view;
    }

    this._dom = dom;
    (this._dom as any).$view = this;
  }

  public eq(node: MarkdownNode): boolean {
    return node.type === this.node.type;
  }

  public setNode(node: MarkdownNode): void {
    this.node = node;
  }

  public setParent(parent: ContentView): void {
    if (this.parent != parent) {
      this.parent?.removeChild(this, false);

      this.parent = parent;
    }
  }

  public appendChild(view: ContentView): void {
    this.children.push(view);

    view.setParent(this);
    this.dom.appendChild(view.dom);
  }

  public insertBefore(view: ContentView, reference: ContentView): void {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === reference) {
        this.children.splice(i, 0, view);

        view.setParent(this);
        this.dom.insertBefore(view.dom, reference.dom);

        break;
      }
    }
  }

  public removeChild(view: ContentView, shouldDestroy = true): ContentView {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === view) {
        shouldDestroy && this.children[i].destroy();

        break;
      }
    }

    return view;
  }

  public applyNode(node: MarkdownNode): void {
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

      view = ContentView.createViewByNodeType(newChild);

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
  }

  public isOpend(): boolean {
    return true;
  }

  public destroy(): void {
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

  public static get(node: Node): ContentView | null {
    return (node && (node as any).$view) || null;
  }

  public static craete(node: MarkdownNode): ContentView {
    throw Error(
      'This static method cannot be called directly. It must be overridden by a subclass.'
    );
  }

  public static setNodeRelationMap(
    nodeRelationMap: Map<typeof MarkdownNode, typeof ContentView>
  ): void {
    this.nodeRelationMap = nodeRelationMap;
  }

  private static createViewByNodeType(node: MarkdownNode): ContentView | null {
    const Constructor = this.nodeRelationMap.get(Object.getPrototypeOf(node).constructor);

    if (Constructor) {
      return Constructor.craete(node);
    }

    return null;
  }
}

export default ContentView;

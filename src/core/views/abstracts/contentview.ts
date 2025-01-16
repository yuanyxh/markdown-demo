import type { MarkdownNode } from 'commonmark-java-js';

import EventHandler from '@/views/event/eventhandler';

abstract class ContentView {
  public abstract length: number;
  public abstract children: ContentView[];

  protected handler: EventHandler = EventHandler.create(this);
  protected parent: ContentView | null = null;
  protected node: MarkdownNode;
  private _dom: HTMLElement;

  protected static nodeRelationMap = new Map<typeof MarkdownNode, typeof ContentView>();

  public constructor(node: MarkdownNode) {
    this.node = node;
    this._dom = this.createElement(node);

    this.handler.listenForViewDOM(this._dom);
  }

  public get dom(): HTMLElement {
    return this._dom;
  }

  public set dom(dom: HTMLElement) {
    if (this.dom) {
      this.handler.unlistenForViewDOM(this.dom);
    }

    this._dom = dom;
    this.handler.listenForViewDOM(dom);
  }

  public get posAtStart(): number {
    return this.parent ? this.parent.posBefore(this) : 0;
  }

  public get posAtEnd(): number {
    return this.posAtStart + this.length;
  }

  public posBefore(view: ContentView): number {
    let pos = this.posAtStart;

    for (const child of this.children) {
      if (child == view) {
        return pos;
      }

      pos += child.length;
    }

    throw new RangeError('Invalid child in posBefore');
  }

  public posAfter(view: ContentView): number {
    return this.posBefore(view) + view.length;
  }

  public eq(node: MarkdownNode): boolean {
    return node.type === this.node?.type;
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

  public locatePosFromDOM(dom: Node, offset: number): number {
    let pos = -1;
    for (const child of this.children) {
      if ((pos = child.locatePosFromDOM(dom, offset)) !== -1) {
        return pos;
      }
    }

    return -1;
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

  public sync(node: MarkdownNode): void {
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
          children[oldIndex].sync(nodeChild);
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

      view = ContentView.createInstanceForNodeType(newChild);

      if (view) {
        this.children[i + 1]
          ? this.insertBefore(view, this.children[i + 1])
          : this.appendChild(view);

        newChildren.push(view);

        if (view.isOpend()) {
          view.sync(newChild);
        }
      }
    }

    // Always replace the old markdown nodes.
    this.setNode(node);

    this.children = newChildren;
  }

  public shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return (
      this.dom.contains(e.detail.range.startContainer) &&
      this.dom.contains(e.detail.range.endContainer)
    );
  }

  public isOpend(): boolean {
    return true;
  }

  public destroy(): void {
    if (this.dom.isConnected) {
      this.dom.remove();
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].destroy();
    }

    this.parent = null;
    this.handler.unlistenForViewDOM(this.dom);
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

  private static createInstanceForNodeType(node: MarkdownNode): ContentView | null {
    const Constructor = this.nodeRelationMap.get(Object.getPrototypeOf(node).constructor);

    if (Constructor) {
      return Constructor.craete(node);
    }

    return null;
  }
}

export default ContentView;

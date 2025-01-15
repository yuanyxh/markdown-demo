import type EventHandler from '@/views/event/eventhandler';

import { MarkdownNode } from 'commonmark-java-js';

abstract class ContentView {
  public abstract length: number;
  public abstract children: ContentView[];
  protected abstract handler: EventHandler;

  protected _parent: ContentView | null = null;
  protected _dom!: HTMLElement;
  protected _node!: MarkdownNode;

  public get parent(): ContentView | null {
    return this._parent;
  }

  public get dom(): HTMLElement {
    return this._dom;
  }

  protected get node(): MarkdownNode {
    return this._node;
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
    return node.type === this.node.type;
  }

  public setDOM(dom: HTMLElement): void {
    if (this.dom) {
      this.handler.unlistenForView();
    }

    this._dom = dom;
    this.handler.listenForView();
  }

  public setNode(node: MarkdownNode): void {
    this._node = node;
  }

  public setParent(parent: ContentView): void {
    if (this.parent != parent) {
      this.parent?.removeChild(this, false);

      this._parent = parent;
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
    this.dom.appendChild(view.toDOMRepr());
  }

  public insertBefore(view: ContentView, reference: ContentView): void {
    const newChildren: ContentView[] = [];

    for (const child of this.children) {
      if (child === reference) {
        newChildren.push(view, reference);

        view.setParent(this);
        this.dom.insertBefore(view.toDOMRepr(), reference.dom);
      } else {
        newChildren.push(child);
      }
    }

    this.children = newChildren;
  }

  public removeChild(view: ContentView, shouldDestroy = true): ContentView {
    const newChildren: ContentView[] = [];

    for (const child of this.children) {
      if (child === view) {
        shouldDestroy && child.destroy();
      } else {
        newChildren.push(child);
      }
    }

    this.children = newChildren;

    return view;
  }

  public sync(node: MarkdownNode): void {
    const children = this.children.slice(0);
    const nodeChildren = node.children;

    let index = 0;
    let lastIndex = 0;
    let child: ContentView;
    let nodeChild: MarkdownNode;

    for (; index < nodeChildren.length; index++) {
      child = children[index];
      nodeChild = nodeChildren[index];

      const oldIndex = children.findIndex((child) => child.eq(nodeChild));

      if (oldIndex >= 0) {
        if (oldIndex < lastIndex) {
          if (children[index + 1]) {
            this.insertBefore(children[oldIndex], children[index + 1]);
          } else {
            this.appendChild(children[oldIndex]);
          }
        } else {
          lastIndex = Math.max(oldIndex, lastIndex);
        }

        children[oldIndex].sync(nodeChild);
      } else {
        if (child) {
          this.removeChild(child);
        }

        // this.appendChild();
      }
    }

    this.setNode(node);
  }

  public shouldHandleEvent(e: CustomEvent<ViewEventDetails>): boolean {
    return (
      this.dom.contains(e.detail.range.startContainer) &&
      this.dom.contains(e.detail.range.endContainer)
    );
  }

  public destroy(): void {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].destroy();
    }

    this._parent = null;
    this.handler.unlistenForView();
    this.dom.remove();
  }

  public abstract toDOMRepr(): HTMLElement;

  public static get(node: Node): ContentView | null {
    return (node && (node as any).$view) || null;
  }
}

export default ContentView;

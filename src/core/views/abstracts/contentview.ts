import type { MarkdownNode } from 'commonmark-java-js';

import type EventHandler from '@/views/event/eventhandler';

export interface Difference {
  type: 'insert' | 'remove' | 'move';
  index: number;
  node: MarkdownNode;
  view?: ContentView;
}

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

  public sync(node: MarkdownNode): void {
    const children = this.children;
    const nodeChildren = node.children;

    const differences: Difference[] = [];
    const usedChild: ContentView[] = [];

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
          differences.push({
            type: 'move',
            index: index,
            view: children[oldIndex],
            node: nodeChild
          });
        } else {
          lastIndex = Math.max(oldIndex, lastIndex);
        }

        children[oldIndex].sync(nodeChild);
        usedChild.push(children[oldIndex]);
      } else {
        lastIndex = Math.max(index, lastIndex);

        if (child) {
          differences.push({ type: 'remove', index, view: child, node: child.node });
        }

        differences.push({ type: 'insert', index, node: nodeChild });
      }
    }

    for (const child of children) {
      if (!usedChild.includes(child)) {
        differences.push({ type: 'remove', index: -1, view: child, node: child.node });
      }
    }

    console.log(differences);
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

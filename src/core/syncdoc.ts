import type { Text as MarkdownText } from 'commonmark-java-js';

import type Editor from './editor';
import type { EditorContextConfig, ExtendsMarkdownNode } from './types';

import { NodeTools, TypeTools } from '@/utils';

/** Synchronize the document */
class SyncDoc {
  private context: Editor;

  public constructor(config: EditorContextConfig) {
    this.context = config.context;
  }

  /**
   * Append the Markdown node to the DOM tree.
   *
   * @param node The {@link ExtendsMarkdownNode | Markdown node}.
   * @param el DOM node.
   * @returns
   */
  public attach(node: ExtendsMarkdownNode, el: Node): void {
    el.$virtNode = node;
    node.meta.$dom = el;

    this.getKey(node);

    if (TypeTools.isImage(node)) {
      return;
    }

    if (TypeTools.isCodeBlock(node)) {
      if (
        el.firstChild instanceof HTMLElement &&
        el.firstChild.tagName.toLocaleLowerCase() === 'code'
      ) {
        el.firstChild.$virtNode = node;
      }
    }

    const children = node.children;
    const elChildren = el.childNodes;

    for (let i = 0; i < children.length; i++) {
      this.attach(children[i], elChildren[i]);
    }
  }

  /**
   * Synchronize the document to the DOM tree and perform necessary checks.
   *
   * @param node The {@link ExtendsMarkdownNode | Markdown node}.
   * @param oldNode The {@link ExtendsMarkdownNode | Old Markdown node}.
   * @returns
   */
  public sync(node: ExtendsMarkdownNode, oldNode: ExtendsMarkdownNode): boolean {
    return this.diff(node, oldNode);
  }

  private diff(newNode: ExtendsMarkdownNode, oldNode: ExtendsMarkdownNode): boolean {
    if (this.context.isInRangeScope(newNode)) {
      newNode = this.context
        .getPlugins(NodeTools.getConstructor(newNode))
        .reduce((n, plugin) => plugin.adjustNode(n), newNode);
    }

    const newChildren = newNode.children;
    const oldChildren = oldNode.children;

    let nextIndex = 0;
    let lastIndex = 0;
    let newChild: ExtendsMarkdownNode;
    let oldChild: ExtendsMarkdownNode;

    let changed = false;

    for (; nextIndex < newChildren.length; nextIndex++) {
      newChild = newChildren[nextIndex];
      oldChild = oldChildren[nextIndex];

      const oldIndex = oldChildren.findIndex((old) => this.isSomeNode(newChild, old));

      if (oldIndex !== -1) {
        if (oldIndex < lastIndex) {
          this.moveTo(oldChild, nextIndex, oldNode);

          changed = true;
        } else {
          lastIndex = oldIndex;
        }

        oldChildren[oldIndex].meta.synced = true;
      } else {
        lastIndex = Math.max(nextIndex, lastIndex);

        if (!oldChild) {
          this.insert(newChild, nextIndex, oldNode);

          changed = true;

          continue;
        } else if (this.isSomeNodeType(newChild, oldChild)) {
          if (
            TypeTools.isMarkdownText(newChild) &&
            TypeTools.isMarkdownText(oldChild) &&
            this.isTextChanged(newChild, oldChild)
          ) {
            this.replaceText(newChild, oldChild);

            changed = true;
          } else {
            const childChanged = this.diff(newChild, oldChild);

            if (!changed) {
              changed = childChanged;
            }
          }

          oldChild.meta.synced = true;
        } else {
          this.insert(newChild, nextIndex, oldNode);

          changed = true;
        }
      }
    }

    for (let i = 0; i < oldChildren.length; i++) {
      if (!oldChildren[i].meta.synced) {
        this.remove(oldNode, oldChildren[i]);

        changed = true;
      }
    }

    return changed;
  }

  private getKey(node: ExtendsMarkdownNode): string {
    if (node.meta.key) {
      return node.meta.key;
    }

    return (node.meta.key = this.context.source.slice(node.inputIndex, node.inputEndIndex));
  }

  private isTextChanged(newNode: MarkdownText, oldNode: MarkdownText): boolean {
    return newNode.getLiteral() !== oldNode.getLiteral();
  }

  private isSomeNode(newNode: ExtendsMarkdownNode, oldNode: ExtendsMarkdownNode): boolean {
    return (
      !oldNode.meta.synced &&
      this.isSomeNodeType(newNode, oldNode) &&
      this.getKey(newNode) === this.getKey(oldNode)
    );
  }

  private isSomeNodeType(newNode: ExtendsMarkdownNode, oldNode: ExtendsMarkdownNode): boolean {
    return newNode.type === oldNode.type;
  }

  private replaceText(newNode: MarkdownText, oldNode: MarkdownText): void {
    oldNode.meta.$dom.textContent = newNode.getLiteral();
  }

  private moveTo(
    oldNode: ExtendsMarkdownNode,
    newIndex: number,
    parent: ExtendsMarkdownNode
  ): void {
    const next = parent.meta.$dom.childNodes[newIndex + 1];

    if (next) {
      parent.meta.$dom.insertBefore(oldNode.meta.$dom, next);
    } else {
      parent.meta.$dom.appendChild(oldNode.meta.$dom);
    }
  }

  private insert(newNode: ExtendsMarkdownNode, index: number, parent: ExtendsMarkdownNode): void {
    const prev = parent.meta.$dom.childNodes[index - 1];

    if (prev && TypeTools.isElement(prev)) {
      prev.insertAdjacentHTML('afterend', this.context.render(newNode));
    } else if (TypeTools.isElement(parent.meta.$dom)) {
      parent.meta.$dom.insertAdjacentHTML('afterbegin', this.context.render(newNode));
    }
  }

  private remove(parent: ExtendsMarkdownNode, oldNode: ExtendsMarkdownNode) {
    parent.meta.$dom.removeChild(oldNode.meta.$dom);
  }
}

export default SyncDoc;

import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';

import type { Text as MarkdownText } from 'commonmark-java-js';

import { getSourcePosition } from './utils/source';
import TypeTools from './utils/typetools';

interface SyncDocConfig {
  context: Editor;
}

class SyncDoc {
  private context: Editor;

  public constructor(config: SyncDocConfig) {
    this.context = config.context;
  }

  public attach(node: MarkdownNode, el: Node) {
    el.$virtNode = node;
    node.meta.$dom = el;

    this.getKey(node);

    if (TypeTools.isImage(node)) {
      return false;
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

  public sync(node: MarkdownNode, oldNode: MarkdownNode) {
    return this.diff(node, oldNode);
  }

  private diff(newNode: MarkdownNode, oldNode: MarkdownNode): boolean {
    const newChildren = newNode.children;
    const oldChildren = oldNode.children;

    let nextIndex = 0;
    let lastIndex = 0;
    let newChild: MarkdownNode;
    let oldChild: MarkdownNode;

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

  private getKey(node: MarkdownNode) {
    if (node.meta.key) {
      return node.meta.key;
    }

    const { inputIndex, inputEndIndex } = getSourcePosition(node);

    return (node.meta.key = this.context.source.slice(inputIndex, inputEndIndex));
  }

  private isTextChanged(newNode: MarkdownText, oldNode: MarkdownText) {
    return newNode.getLiteral() !== oldNode.getLiteral();
  }

  private isSomeNode(newNode: MarkdownNode, oldNode: MarkdownNode) {
    return (
      !oldNode.meta.synced &&
      this.isSomeNodeType(newNode, oldNode) &&
      this.getKey(newNode) === this.getKey(oldNode)
    );
  }

  private isSomeNodeType(newNode: MarkdownNode, oldNode: MarkdownNode) {
    return newNode.type === oldNode.type;
  }

  private replaceText(newNode: MarkdownText, oldNode: MarkdownText) {
    oldNode.meta.$dom.textContent = newNode.getLiteral();
  }

  private moveTo(oldNode: MarkdownNode, newIndex: number, parent: MarkdownNode) {
    const next = parent.meta.$dom.childNodes[newIndex + 1];

    if (next) {
      parent.meta.$dom.insertBefore(oldNode.meta.$dom, next);
    } else {
      parent.meta.$dom.appendChild(oldNode.meta.$dom);
    }
  }

  private insert(newNode: MarkdownNode, index: number, parent: MarkdownNode) {
    const prev = parent.meta.$dom.childNodes[index - 1];

    if (prev && TypeTools.isElement(prev)) {
      prev.insertAdjacentHTML('afterend', this.context.renderer.render(newNode));
    } else {
      parent.meta.$dom.insertAdjacentHTML('afterbegin', this.context.renderer.render(newNode));
    }
  }

  private remove(parent: MarkdownNode, oldNode: MarkdownNode) {
    parent.meta.$dom.removeChild(oldNode.meta.$dom);
  }
}

export default SyncDoc;

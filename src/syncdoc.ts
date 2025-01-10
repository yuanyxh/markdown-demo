import type { Editor } from './main';
import type { MarkdownNode } from 'commonmark-java-js';

import { FencedCodeBlock, Image, IndentedCodeBlock, Text } from 'commonmark-java-js';
import { getSourcePosition } from './utils/source';

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

    if (node instanceof Image) {
      return false;
    }

    if (node instanceof FencedCodeBlock || node instanceof IndentedCodeBlock) {
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

    let changed = false;

    for (; nextIndex < newChildren.length; nextIndex++) {
      const oldIndex = oldChildren.findIndex((old) => this.isSomeNode(newChildren[nextIndex], old));

      if (oldIndex !== -1) {
        if (oldIndex < lastIndex) {
          this.moveTo(oldChildren[oldIndex], nextIndex, oldNode);

          changed = true;
        } else {
          lastIndex = oldIndex;
        }

        oldChildren[oldIndex].meta.synced = true;
      } else {
        lastIndex = Math.max(nextIndex, lastIndex);

        if (!oldChildren[nextIndex]) {
          this.insert(newChildren[nextIndex], nextIndex, oldNode);

          changed = true;

          continue;
        } else if (this.isSomeNodeType(newChildren[nextIndex], oldChildren[nextIndex])) {
          if (this.isTextChanged(newChildren[nextIndex], oldChildren[nextIndex])) {
            this.insert(newChildren[nextIndex], nextIndex, oldNode);

            changed = true;
          } else {
            const childChanged = this.diff(newChildren[nextIndex], oldChildren[nextIndex]);

            if (!changed) {
              changed = childChanged;
            }

            oldChildren[nextIndex].meta.synced = true;
          }
        } else {
          this.insert(newChildren[nextIndex], nextIndex, oldNode);

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

  private isTextChanged(newNode: MarkdownNode, oldNode: MarkdownNode) {
    return (
      newNode instanceof Text &&
      oldNode instanceof Text &&
      newNode.getLiteral() !== oldNode.getLiteral()
    );
  }

  private isSomeNode(newNode: MarkdownNode, oldNode: MarkdownNode) {
    return (
      this.isSomeNodeType(newNode, oldNode) &&
      !oldNode.meta.synced &&
      this.getKey(newNode) === this.getKey(oldNode)
    );
  }

  private isSomeNodeType(newNode: MarkdownNode, oldNode: MarkdownNode) {
    return newNode.type === oldNode.type;
  }

  private moveTo(oldNode: MarkdownNode, newIndex: number, parent: MarkdownNode) {
    const next = (parent.meta.$dom as HTMLElement).childNodes[newIndex + 1];

    if (next) {
      (parent.meta.$dom as HTMLElement).insertBefore(oldNode.meta.$dom, next);
    } else {
      (parent.meta.$dom as HTMLElement).appendChild(oldNode.meta.$dom);
    }
  }

  private insert(newNode: MarkdownNode, index: number, parent: MarkdownNode) {
    const prev = (parent.meta.$dom as HTMLElement).childNodes[index - 1];

    if (prev && prev instanceof HTMLElement) {
      prev.insertAdjacentHTML('afterend', this.context.renderer.render(newNode));
    } else {
      (parent.meta.$dom as HTMLElement).insertAdjacentHTML(
        'afterbegin',
        this.context.renderer.render(newNode)
      );
    }
  }

  private remove(parent: MarkdownNode, oldNode: MarkdownNode) {
    parent.meta.$dom.removeChild(oldNode.meta.$dom);
  }
}

export default SyncDoc;

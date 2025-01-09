import type { Editor } from './main';
import type { MarkdownNode } from 'commonmark-java-js';
import type HtmlRenderer from './renderer/HtmlRenderer';

import { FencedCodeBlock, Image, IndentedCodeBlock } from 'commonmark-java-js';
import { getElChildren } from './utils';

interface SyncDocConfig {
  context: Editor;
}

function isBlock(node: MarkdownNode) {
  return node.isBlock() && node.type !== 'document';
}

/**
 * 按元素类型进行对比，同时将变更的内联节点冒泡提升为块节点的变更
 */
function diff(node: MarkdownNode, oldNode: MarkdownNode): IPatchNode[] | boolean {
  if (node.type !== oldNode.type) {
    return isBlock(oldNode) ? [{ type: 'replace', node: oldNode, updateNode: node }] : true;
  }

  const childNodes = node.getChildren();
  const oldChildNodes = oldNode.getChildren();

  const patchList: IPatchNode[] = [];

  let curr: MarkdownNode;
  let oldCurr: MarkdownNode;

  for (let i = 0; i < childNodes.length; i++) {
    curr = childNodes[i];
    oldCurr = oldChildNodes[i];

    if (!oldCurr) {
      if (oldChildNodes[i - 1]) {
        if (isBlock(oldChildNodes[i - 1])) {
          patchList.push({ type: 'insertAfter', node: oldChildNodes[i - 1], updateNode: curr });
        } else {
          return true;
        }
      } else {
        if (isBlock(oldNode)) {
          patchList.push({ type: 'append', node: oldNode, updateNode: curr });
        } else {
          return true;
        }
      }

      continue;
    }

    const result = diff(curr, oldCurr);

    if (typeof result === 'boolean') {
      if (result) {
        if (isBlock(oldCurr)) {
          patchList.push({ type: 'replace', node: oldCurr, updateNode: curr });
        } else {
          return true;
        }
      }
    } else {
      patchList.push(...result);
    }
  }

  for (let i = childNodes.length; i < oldChildNodes.length; i++) {
    patchList.push({ type: 'remove', node: oldChildNodes[i] });
  }

  if (!patchList.length) {
    return false;
  }

  return patchList;
}

function patch(context: Editor, patchList: IPatchNode[]) {
  let curr: IPatchNode;
  let node: MarkdownNode | null;
  let dom: HTMLElement;

  for (let i = 0; i < patchList.length; i++) {
    curr = patchList[i];
    node = curr.node;
    dom = curr.node.meta.$dom;

    switch (curr.type) {
      case 'remove':
        dom.remove();

        break;

      case 'insertAfter':
        node.meta.$dom.insertAdjacentHTML(
          'afterend',
          context.renderer.render(curr.updateNode as MarkdownNode)
        );

        break;

      case 'append':
        node.meta.$dom.insertAdjacentHTML(
          'afterbegin',
          context.renderer.render(curr.updateNode as MarkdownNode)
        );

        break;

      case 'replace':
        dom.outerHTML = context.renderer.render(curr.updateNode as MarkdownNode);

        break;

      default:
        break;
    }
  }
}

class SyncDoc {
  private context: Editor;

  public constructor(config: SyncDocConfig) {
    this.context = config.context;
  }

  public attach(node: MarkdownNode, el: Node) {
    el.$virtNode = node;
    node.meta.$dom = el;

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

    const children = node.getChildren();
    const elChildren = getElChildren(el);

    for (let i = 0; i < children.length; i++) {
      this.attach(children[i], elChildren[i]);
    }
  }

  public sync(node: MarkdownNode, oldNode: MarkdownNode) {
    const patchList = diff(node, oldNode);

    if (typeof patchList !== 'boolean') {
      patch(this.context, patchList);

      return true;
    }

    return false;
  }
}

export default SyncDoc;

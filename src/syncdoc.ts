import type { Editor } from './main';
import type { MarkdownNode } from 'commonmark-java-js';

import { FencedCodeBlock, Image, IndentedCodeBlock } from 'commonmark-java-js';

interface SyncDocConfig {
  context: Editor;
}

function isBlock(node: MarkdownNode) {
  return node.isBlock() && node.type !== 'document';
}

function create(
  type: TNodeChangeType,
  node: MarkdownNode,
  offset?: number,
  updateNode?: MarkdownNode
): IPatchNode {
  return {
    type,
    updateNode,
    update: (cb) => {
      if (typeof offset === 'number') {
        cb(node.meta.$dom.childNodes[offset]);
      } else {
        cb(node.meta.$dom);
      }
    }
  };
}

/**
 * 按元素类型进行对比，同时将变更的内联节点冒泡提升为块节点的变更
 */
function diff(node: MarkdownNode, oldNode: MarkdownNode): IPatchNode[] | boolean {
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
          patchList.push(create('insertAfter', oldNode, i - 1, curr));
        } else {
          return true;
        }
      } else {
        if (isBlock(oldNode)) {
          patchList.push(create('append', oldNode, 0, curr));
        } else {
          return true;
        }
      }

      continue;
    }

    if (curr.type !== oldCurr.type) {
      if (isBlock(oldCurr)) {
        patchList.push(create('replace', oldNode, i, node));
      } else {
        return true;
      }
    }

    const result = diff(curr, oldCurr);

    if (typeof result === 'boolean') {
      if (result) {
        if (isBlock(oldCurr)) {
          patchList.push(create('replace', oldNode, i, curr));
        } else {
          return true;
        }
      }
    } else {
      patchList.push(...result);
    }
  }

  for (let i = childNodes.length; i < oldChildNodes.length; i++) {
    patchList.push(create('remove', oldChildNodes[i]));
  }

  if (!patchList.length) {
    return false;
  }

  return patchList;
}

function patch(context: Editor, patchList: IPatchNode[]) {
  let curr: IPatchNode;

  for (let i = 0; i < patchList.length; i++) {
    curr = patchList[i];

    switch (curr.type) {
      case 'remove':
        curr.update((dom) => dom.remove());

        break;

      case 'insertAfter':
        curr.update((dom) => {
          dom.insertAdjacentHTML(
            'afterend',
            context.renderer.render(curr.updateNode as MarkdownNode)
          );
        });

        break;

      case 'append':
        curr.update((dom) => {
          dom.insertAdjacentHTML(
            'afterbegin',
            context.renderer.render(curr.updateNode as MarkdownNode)
          );
        });

        break;

      case 'replace':
        curr.update((dom) => {
          dom.outerHTML = context.renderer.render(curr.updateNode as MarkdownNode);
        });

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
    const elChildren = el.childNodes;

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

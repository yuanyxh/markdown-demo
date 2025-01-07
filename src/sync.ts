import type { MarkdownNode } from 'commonmark-java-js';

import { FencedCodeBlock, Image, IndentedCodeBlock } from 'commonmark-java-js';

function filterBreakNode(node: Node) {
  if (node instanceof Text && node.nodeValue === '\n') {
    return false;
  }

  return true;
}

export function sync(el: Node, node: MarkdownNode) {
  el.$virtNode = node;

  if (node instanceof Image) {
    return false;
  }

  const children = node.getChildren();
  const elChildren = Array.from(el.childNodes).filter(filterBreakNode);

  for (let i = 0; i < children.length; i++) {
    sync(elChildren[i], children[i]);
  }

  if (node instanceof FencedCodeBlock || node instanceof IndentedCodeBlock) {
    if (
      el.firstChild instanceof HTMLElement &&
      el.firstChild.tagName.toLocaleLowerCase() === 'code'
    ) {
      el.firstChild.$virtNode = node;
    }
  }
}

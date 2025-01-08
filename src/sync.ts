import type { MarkdownNode } from 'commonmark-java-js';

import { FencedCodeBlock, Image, IndentedCodeBlock } from 'commonmark-java-js';
import { filterBreakNode } from './utils/filter';

export function sync(node: MarkdownNode, el: Node) {
  el.$virtNode = node;

  if (node instanceof Image) {
    return false;
  }

  const children = node.getChildren();
  const elChildren = Array.from(el.childNodes).filter(filterBreakNode);

  for (let i = 0; i < children.length; i++) {
    sync(children[i], elChildren[i]);
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

import type { MarkdownNode } from 'commonmark-java-js';

import { filterBreakNode } from './utils/filter';

export function diff(this: Pick<IEditorContext, 'renderer'>, node: MarkdownNode, el?: Node) {
  if (!el) {
    if (node.isBlock()) {
      patch();
    }

    return true;
  }

  const children = node.getChildren();
  const elChildren = Array.from(el.childNodes).filter(filterBreakNode);

  for (let i = 0; i < children.length; i++) {
    diff.call(this, children[i], elChildren[i]);
  }
}

function patch() {}
